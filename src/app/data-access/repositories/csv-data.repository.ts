// CSV ファイル（武器・武将）を読み込んで型付きデータに変換するリポジトリ
// - `HttpClient` で CSV テキストを取得し、`Papa.parse` で配列に分解します。
// - 列ごとの意味にしたがって `Weapon` / `General` へ詰め替えます。
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import Papa from 'papaparse';
import { Weapon } from '@models/weapon.model';
import { General } from '@models/general.model';

@Injectable({ providedIn: 'root' })
export class CsvDataRepository {
  constructor(private readonly http: HttpClient) {}

  // 武器一覧の CSV を読み込み、`Weapon[]` に変換
  async loadWeapons(): Promise<Weapon[]> {
    const csvText = await firstValueFrom(
      this.http.get('assets/data/武器リスト.csv', { responseType: 'text' })
    );
    const parsed = Papa.parse<string[]>(csvText, {
      delimiter: ',',
      skipEmptyLines: true,
    });
    const weapons: Weapon[] = [];
    for (const row of parsed.data) {
      const fields = row;
      const id = Number(fields[0]);
      if (Number.isNaN(id)) continue;
      const weapon: Weapon = {
        id,
        unitType: fields[1] ?? '',
        name: fields[2] ?? '',
        series: fields[3] || undefined,
        isGacha: (fields[4] ?? '') === '〇',
        owner: fields[5] || undefined,
        effect: fields[6] || undefined,
        str: toNum(fields[8]),
        int: toNum(fields[9]),
        vit: toNum(fields[10]),
        hp: toNum(fields[11]),
      };
      weapons.push(weapon);
    }
    return weapons;
  }

  // 武将一覧の CSV を読み込み、`General[]` に変換
  async loadGenerals(): Promise<General[]> {
    const csvText = await firstValueFrom(
      this.http.get('assets/data/武将リスト.csv', { responseType: 'text' })
    );
    const parsed = Papa.parse<string[]>(csvText, {
      delimiter: ',',
      skipEmptyLines: true,
    });
    const generals: General[] = [];
    for (const row of parsed.data) {
      const f = row;
      const general: General = {
        no: Number(f[0]),
        camp: f[1] ?? '',
        meisho: (f[2] ?? '') === '○' || (f[2] ?? '') === '〇',
        name: f[3] ?? '',
        strInit: toNum(f[4]) ?? 0,
        intInit: toNum(f[5]) ?? 0,
        vitInit: toNum(f[6]) ?? 0,
        hpInit: toNum(f[7]) ?? 0,
        g1: f[8] || undefined,
        g2: f[9] || undefined,
        g3: f[10] || undefined,
        g4: f[11] || undefined,
        g5: f[12] || undefined,
        g6: f[13] || undefined,
        g7: f[14] || undefined,
        stateAngry: f[15] || undefined,
        stateNormal: f[16] || undefined,
        stateFollowPre: f[17] || undefined,
        stateFollowPost: f[18] || undefined,
      };
      generals.push(general);
    }
    return generals;
  }
}

// 数値っぽい文字列を number に変換（空や不正値は undefined）
function toNum(value: string | undefined): number | undefined {
  if (value == null || value === '') return undefined;
  const n = Number(value);
  return Number.isNaN(n) ? undefined : n;
}


