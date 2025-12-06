import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IFilterAngularComp } from 'ag-grid-angular';
import { IFilterParams, IDoesFilterPassParams } from 'ag-grid-community';

// 固定の選択肢を持つ簡易フィルタ（Community で SetFilter 代替）
// - filterParams.values に与えた配列（文字列 or 数値）を選択して一致行のみ表示します
// - 「すべて」を選べばフィルタ解除
type Option = string | number;
type Model = { value: Option | null } | null;

@Component({
  selector: 'app-fixed-set-filter',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="display:flex; gap:6px; align-items:center; padding:4px 6px; flex-wrap:wrap;">
      <label style="display:flex; gap:4px; align-items:center;">
        <input type="radio" name="fixedset" [checked]="value===null" (change)="onChange(null)" />
        <span>すべて</span>
      </label>
      <label *ngFor="let o of options" style="display:flex; gap:4px; align-items:center;">
        <input
          type="radio"
          name="fixedset"
          [checked]="isEqual(value, o)"
          (change)="onChange(o)"
        />
        <span>{{ o }}</span>
      </label>
    </div>
  `,
})
export class FixedSetFilterComponent implements IFilterAngularComp {
  private params!: IFilterParams;
  options: Option[] = [];
  private numericMode = false;
  value: Option | null = null; // null = すべて（フィルタなし）

  // フィルタ初期化：列定義の filterParams.values から選択肢を取得
  agInit(params: IFilterParams): void {
    this.params = params;
    const fp = (this.params.colDef as any)?.filterParams;
    const fromValues = Array.isArray(fp?.values) ? (fp.values as Option[]) : undefined;
    this.options = fromValues ?? [];
    this.numericMode = this.options.every(o => typeof o === 'number');
  }

  isFilterActive(): boolean {
    return this.value !== null;
  }

  // 行がフィルタ条件を満たすか評価
  doesFilterPass(p: IDoesFilterPassParams): boolean {
    if (this.value === null) return true;
    // 推奨: IFilterParams#getValue で当該列のセル値を取得
    const getValue = (this.params as any)?.getValue as ((node: any) => any) | undefined;
    let cell: any = typeof getValue === 'function'
      ? getValue(p.node)
      : (() => {
          const field = (this.params.colDef as any)?.field as string | undefined;
          return field && p.data ? (p.data as any)[field] : undefined;
        })();

    if (this.numericMode) {
      const n = Number(cell);
      return !Number.isNaN(n) && n === Number(this.value);
    } else {
      return String(cell) === String(this.value);
    }
  }

  // 現在のフィルタ状態をグリッドへ保存/復元
  getModel(): Model {
    return this.isFilterActive() ? { value: this.value } : null;
  }

  setModel(model: Model): void {
    this.value = model?.value ?? null;
  }

  // ラジオ切替時にグリッドへ通知
  onChange(v: Option | null): void {
    this.value = v;
    this.params.filterChangedCallback();
  }

  // 値の等価判定（数値は数値として、文字列は文字列として比較）
  isEqual(a: Option | null, b: Option): boolean {
    if (a === null) return false;
    return this.numericMode ? Number(a) === Number(b) : String(a) === String(b);
  }
}


