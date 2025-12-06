// 武将一覧と計算結果を AG Grid で表示・編集するコンポーネント
// - CSV から武将/武器を読み込み、計算サービスで基準値/最終値を算出します。
// - グリッド上でレベル/凸/所持を編集すると、即座に再計算されます。
import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridReadyEvent, GetRowIdParams, GridApi } from 'ag-grid-community';
import { CsvDataRepository } from '@repos/csv-data.repository';
import { ComputeService } from '@services/compute.service';
import { AppConfigService } from '@core/app-config.service';
import { General, UnitState } from '@models/general.model';
import { Weapon } from '@models/weapon.model';
import { Rules } from '@models/rules.model';
import { HaveBooleanFilterComponent } from './have-boolean-filter.component';
// プリセット（表示名→gX）の定義を別ファイルで一元管理
import { presetKeyMap, presetList as PRESET_LIST } from './config/presets';
// 固定選択肢フィルタ（Community対応）を filters 配下へ配置
import { FixedSetFilterComponent } from './filters/fixed-set-filter.component';

type RosterRow = General & UnitState & {
  equipName?: string;
  strBase?: number; intBase?: number; vitBase?: number; hpBase?: number;
  strFinal?: number; intFinal?: number; vitFinal?: number; hpFinal?: number;
};

@Component({
  selector: 'app-roster',
  standalone: true,
  // AG Grid のカスタムフィルタはテンプレ外利用でも imports に登録が必要
  imports: [CommonModule, AgGridAngular, HaveBooleanFilterComponent, FixedSetFilterComponent],
  templateUrl: './roster.component.html',
})
export class RosterComponent implements OnInit {
  // 画面に表示する行データ（signal でリアクティブに更新）
  rows = signal<RosterRow[]>([]);
  // 行IDを固定（スクロールや選択状態を安定化）
  getRowId = (p: GetRowIdParams<RosterRow>) => String(p.data?.no ?? '');
  weapons: Weapon[] = [];
  rules!: Rules;
  // 進捗やエラー表示用の状態
  loading = signal<boolean>(true);
  error = signal<string | null>(null);
  // 重要列のみ表示の切替（初期: 簡易表示 = true）
  compactOnly = signal<boolean>(true);
  // Grid API を保持（列表示/非表示の一括適用に使用）
  private gridApi: GridApi<RosterRow> | null = null;
  // （外部フィルタは撤去。AG Grid内蔵フィルタに一本化）
  // 追加: プリセット用
  private allRows: RosterRow[] = [];
  // ボタンの現在選択（null で未選択＝全件表示）
  activePreset: (keyof typeof presetKeyMap) | null = null;
  // プリセットの表示順（config 定義）
  presetList = PRESET_LIST;
 
  // 全列に共通の設定（サイズ変更・ソート・フィルタなど）
  defaultColDef: ColDef<RosterRow> = {
    resizable: true,
    sortable: true,
    filter: true,
    floatingFilter: false,
    cellClass: (p) => (p.colDef.editable ? 'cell-editable' : 'cell-label'),
  };

  // 列ごとの表示/編集ルールを定義（assets/docs/項目定義.md のフィルタ/ソート要否に準拠）
  columnDefs: ColDef<RosterRow>[] = [
    // no: フィルタ× / ソート○
    { field: 'no', headerName: 'No', width: 70, pinned: 'left', cellClass: 'ag-right-aligned-cell', filter: false, sortable: true },
    {
      field: 'camp',
      headerName: '陣営',
      width: 90,
      pinned: 'left',
      // camp: フィルタ（テキスト: equals）/ ソート×
      filter: 'agTextColumnFilter',
      filterParams: { filterOptions: ['equals'] },
      sortable: false,
      cellRenderer: (p: any) => campBadge(p.value),
      cellClass: 'ag-center-aligned-cell cell-label',
    },
    {
      headerName: '名将',
      width: 80,
      editable: false,
      valueGetter: (p) => (p.data?.meisho ? '○' : '×'), // フィルタ選択を明確に
      pinned: 'left',
      cellRenderer: (p: any) => (p.value === '○' ? `<span class="badge badge-meisho">名将</span>` : ''),
      cellClass: 'ag-center-aligned-cell cell-label',
      // meisho: フィルタ（テキスト: equals）/ ソート×
      filter: false,
      sortable: false,
    },
    // name: フィルタ× / ソート×
    { field: 'name', headerName: '武将名', width: 100, pinned: 'left', filter: false, sortable: false },
    {
      field: 'have',
      headerName: '所持',
      width: 80,
      editable: false,
      cellDataType: 'boolean',
      cellRenderer: (p: any) => this.haveCellRenderer(p),
      cellClass: 'ag-center-aligned-cell cell-editable have-cell',
      // have: カスタム（Community）フィルタ（ON/OFF を選択）
      filter: HaveBooleanFilterComponent,
      sortable: false,
    },
    {
      field: 'toku',
      headerName: '凸',
      width: 80,
      editable: true,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: { values: [0, 1, 2, 3, 4, 5] },
      valueFormatter: (p) => `${p.value}`,
      cellClass: 'ag-right-aligned-cell cell-editable',
      // 凸: 固定選択（0～5）
      filter: FixedSetFilterComponent,
      filterParams: { values: [0, 1, 2, 3, 4, 5] },
      sortable: true,
    },
    {
      field: 'level',
      headerName: 'レベル',
      width: 100,
      editable: true,
      cellEditor: 'agNumberCellEditor',
      valueFormatter: (p) => `${p.value}`,
      cellClass: 'ag-right-aligned-cell cell-editable',
      // level: フィルタ× / ソート○
      filter: false,
      sortable: true,
    },
    // equip: フィルタ× / ソート×
    { field: 'equipName', headerName: '装備', width: 160, filter: false, sortable: false },
    // *_init: フィルタ× / ソート○
    { field: 'strInit', headerName: '武(初期)', width: 90, cellClass: 'ag-right-aligned-cell', filter: false, sortable: true },
    { field: 'intInit', headerName: '知(初期)', width: 90, cellClass: 'ag-right-aligned-cell', filter: false, sortable: true },
    { field: 'vitInit', headerName: '耐(初期)', width: 90, cellClass: 'ag-right-aligned-cell', filter: false, sortable: true },
    { field: 'hpInit', headerName: '体(初期)', width: 90, cellClass: 'ag-right-aligned-cell', filter: false, sortable: true },
    // *_base: フィルタ× / ソート○
    { field: 'strBase', headerName: '武(基準)', width: 90, cellClass: 'ag-right-aligned-cell', filter: false, sortable: true },
    { field: 'intBase', headerName: '知(基準)', width: 90, cellClass: 'ag-right-aligned-cell', filter: false, sortable: true },
    { field: 'vitBase', headerName: '耐(基準)', width: 90, cellClass: 'ag-right-aligned-cell', filter: false, sortable: true },
    { field: 'hpBase', headerName: '体(基準)', width: 90, cellClass: 'ag-right-aligned-cell', filter: false, sortable: true },
    // *_final: フィルタ× / ソート○
    { field: 'strFinal', headerName: '武', width: 90, cellClass: 'ag-right-aligned-cell', filter: false, sortable: true },
    { field: 'intFinal', headerName: '知', width: 90, cellClass: 'ag-right-aligned-cell', filter: false, sortable: true },
    { field: 'vitFinal', headerName: '耐', width: 90, cellClass: 'ag-right-aligned-cell', filter: false, sortable: true },
    { field: 'hpFinal', headerName: '体', width: 90, cellClass: 'ag-right-aligned-cell', filter: false, sortable: true },
    // state_*: 固定選択の Set フィルタ / ソート○
    {
      field: 'stateAngry',
      headerName: '怒',
      width: 90,
      filter: FixedSetFilterComponent,
      filterParams: { values: ['転倒', '浮遊', 'ＫＢ', 'なし'] },
      sortable: true,
    },
    {
      field: 'stateNormal',
      headerName: '普',
      width: 90,
      filter: FixedSetFilterComponent,
      filterParams: { values: ['転倒', '浮遊', 'ＫＢ', 'なし'] },
      sortable: true,
    },
    {
      field: 'stateFollowPre',
      headerName: '追元',
      width: 90,
      filter: FixedSetFilterComponent,
      filterParams: { values: ['転倒', '浮遊', 'ＫＢ', 'なし', 'ｶｳﾝﾀｰ', 'ALL', '召喚'] },
      sortable: true,
    },
    {
      field: 'stateFollowPost',
      headerName: '追後',
      width: 90,
      filter: FixedSetFilterComponent,
      filterParams: { values: ['転倒', '浮遊', 'ＫＢ', 'なし', 'ｶｳﾝﾀｰ', 'ALL', '召喚'] },
      sortable: true,
    },
  ];

  constructor(
    private readonly repo: CsvDataRepository,
    private readonly compute: ComputeService,
    private readonly appConfig: AppConfigService
  ) {}

  // 最小限の日本語ロケール（必要に応じて拡張可能）
  readonly localeJA: Record<string, string> = {
    page: 'ページ',
    more: 'もっと',
    to: '～',
    of: '／',
    next: '次',
    last: '最後',
    first: '最初',
    previous: '前',
    loadingOoo: '読み込み中...',
    applyFilter: '適用',
    equals: '等しい',
    notEqual: '等しくない',
    contains: '含む',
    notContains: '含まない',
    startsWith: 'で始まる',
    endsWith: 'で終わる',
    filterOoo: 'フィルタ...',
    selectAll: 'すべて選択',
    searchOoo: '検索...',
    noRowsToShow: '表示する行がありません',
    blank: '空白',
    notBlank: '空白以外',
    // ヘッダツールパネル
    columns: '列',
    filters: 'フィルタ',
  };

  // 初期化：ルール→CSV 取得→行作成→再計算→反映
  async ngOnInit(): Promise<void> {
    try {
      this.rules = await this.appConfig.loadRules();
      const [generals, weapons] = await Promise.all([
        this.repo.loadGenerals(),
        this.repo.loadWeapons(),
      ]);
      console.log('generals loaded:', generals.length);
      console.log('weapons loaded:', weapons.length);
      this.weapons = weapons;
      const rows = generals.map(g => this.createRow(g));
      rows.forEach(r => this.recalculate(r));
      this.allRows = rows;
      this.rows.set(this.applyPresetFilter(this.allRows)); //フィルタ用ボタンの押下状態で絞込
    } catch (e: any) {
      console.error('データ読み込みエラー', e);
      this.error.set(e?.message ?? '読み込みに失敗しました');
    } finally {
      this.loading.set(false);
    }
  }

  onGridReady(e: GridReadyEvent): void {
    this.gridApi = e.api as GridApi<RosterRow>;
    this.applyCompactVisibility();
  }

  // セル編集時に値を補正し、再計算して反映
  onCellValueChanged(event: any): void {
    const row: RosterRow = event.data;
    row.level = clampInt(row.level, this.rules.limits.level.min, this.rules.limits.level.max, this.rules.defaults.level);
    row.toku = clampInt(row.toku, this.rules.limits.toku.min, this.rules.limits.toku.max, this.rules.defaults.toku);
    row.have = !!row.have;
    this.recalculate(row);
    // 配列を差し替えず、該当セルのみ再描画してスクロール/選択を保持
    if (event?.api && event?.node) {
      event.api.refreshCells({ rowNodes: [event.node], force: true });
    }
  }

  // 武将データから表示用の 1 行を組み立てる
  private createRow(general: General): RosterRow {
    const defaultState: UnitState = {
      have: false,
      level: this.rules.defaults.level,
      toku: this.rules.defaults.toku,
      equipWeaponId: this.autopickWeaponId(general),
    };
    const equip = this.weapons.find(w => w.id === defaultState.equipWeaponId) || null;
    return {
      ...general,
      ...defaultState,
      equipName: equip?.name ?? '',
    };
  }

  // 基準値/最終値を計算し、行に書き戻す
  private recalculate(row: RosterRow): void {
    const weapon = this.weapons.find(w => w.id === row.equipWeaponId) || null;
    const base = this.compute.computeBaseStats(row, weapon);
    const finals = this.compute.computeFinalStats(base, row.level, row.toku, this.rules);
    Object.assign(row, finals);
    row.equipName = weapon?.name ?? '';
  }

  applyPreset(preset: string): void {
    this.activePreset = this.activePreset === preset ? null : (preset as any);
    this.rows.set(this.applyPresetFilter(this.allRows));
  }

  // プリセットフィルター（activePreset が設定されていれば、そのプリセットに合致する行のみを返す）
  // 要は、activePreset に設定されているプリセットの武将のみを表示する
  private applyPresetFilter(source: RosterRow[]): RosterRow[] {
    if (!this.activePreset) return source;
    const key = presetKeyMap[this.activePreset];
    return source.filter(r => !!(r as any)[key]);
  }

  // 所有者名が一致する武器があれば自動選択（なければ null）
  private autopickWeaponId(general: General): number | null {
    const byOwner = this.weapons.find(w => w.owner === general.name);
    return byOwner?.id ?? null;
  }

  // 外部フィルタは撤去（AG Grid 内蔵フィルタを使用）
  // カスタムチェックボックス（所持）
  private haveCellRenderer = (p: any): HTMLElement => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `checkpill${p.value ? ' checked' : ''}`;
    btn.setAttribute('aria-label', p.value ? '所持あり' : '所持なし');
    btn.onclick = (ev) => {
      ev.stopPropagation();
      const newVal = !p.value;
      p.node.setDataValue('have', newVal);
      this.onCellValueChanged({ data: p.node.data });
      // 再描画
      p.api.refreshCells({ rowNodes: [p.node], columns: [p.column] });
    };
    return btn;
  };

  // 切替ボタンクリック時に表示列を適用
  toggleCompact(): void {
    this.compactOnly.update(v => !v);
    this.applyCompactVisibility();
  }

  // 重要列のみ表示の適用（true のとき指定列以外を hide）
  private applyCompactVisibility(): void {
    if (!this.gridApi) return;
    const important = [
      'name', 'level', 'toku',
      'strFinal', 'intFinal', 'vitFinal', 'hpFinal',
      'stateAngry', 'stateNormal', 'stateFollowPre', 'stateFollowPost',
    ];
    const all = this.gridApi.getColumns()?.map((c: any) => c.getColId()) ?? [];
    const state = all.map((colId: string) => ({
      colId,
      hide: this.compactOnly() ? !important.includes(colId) : false,
    }));
    this.gridApi.applyColumnState({ state, applyOrder: false });
  }
}

function campBadge(camp: string | undefined): string {
  if (!camp) return '';
  const map: Record<string, string> = {
    '蜀': 'camp-shu',
    '魏': 'camp-gi',
    '呉': 'camp-go',
    '群': 'camp-gun',
  };
  const cls = map[camp] ?? 'camp-etc';
  return `<span class="badge badge-camp ${cls}">${camp}</span>`;
}

function clampInt(
  value: any,
  min: number,
  max: number,
  fallback: number
): number {
  const n = Number(value);
  if (Number.isNaN(n)) return fallback;
  return Math.max(min, Math.min(max, Math.trunc(n)));
}

