// 各種ステータスの計算ロジックをまとめたサービス
// - 武将の初期値 + 武器補正 → 基準値を算出
// - さらにレベル/凸/ルールに応じて最終値を算出します
import { Injectable } from '@angular/core';
import { Rules } from '@models/rules.model';
import { General } from '@models/general.model';
import { Weapon } from '@models/weapon.model';
import { ComputedStats } from '@models/computed-stats.model';

@Injectable({ providedIn: 'root' })
export class ComputeService {
  // 武将と装備から「基準値」を作る（最終値の前段階）
  computeBaseStats(general: General, weapon?: Weapon | null): Omit<ComputedStats, 'strFinal' | 'intFinal' | 'vitFinal' | 'hpFinal'> {
    const strWeapon = weapon?.str ?? 0;
    const intWeapon = weapon?.int ?? 0;
    const vitWeapon = weapon?.vit ?? 0;
    const hpWeapon = weapon?.hp ?? 0;
    return {
      strBase: general.strInit + strWeapon,
      intBase: general.intInit + intWeapon,
      vitBase: general.vitInit + vitWeapon,
      hpBase: general.hpInit + hpWeapon,
    };
  }

  // ルール（丸めや 100 レベル時の特例）を考慮して最終値を求める
  computeFinalStats(
    base: { strBase: number; intBase: number; vitBase: number; hpBase: number },
    level: number,
    toku: number,
    rules: Rules
  ): ComputedStats {
    return {
      strBase: base.strBase,
      intBase: base.intBase,
      vitBase: base.vitBase,
      hpBase: base.hpBase,
      strFinal: this.computeFinalStat(base.strBase, level, toku, rules),
      intFinal: this.computeFinalStat(base.intBase, level, toku, rules),
      vitFinal: this.computeFinalStat(base.vitBase, level, toku, rules),
      hpFinal: this.computeFinalStat(base.hpBase, level, toku, rules),
    };
  }

  // 1 項目分の最終値を計算するヘルパー
  computeFinalStat(base: number, level: number, toku: number, rules: Rules): number {
    const q = Math.floor(level / 10);
    // 100 レベル特例: toku(凸) < 5 のとき 10刻みボーナスから 0.5 を減算
    const d = rules.levelFactor.hundredsRule && level === 100 && toku < 5 ? -0.5 : 0;

    // (ベース + レベル成長 + 10刻みボーナス＋特例) に最後に凸補正を掛ける
    const inner =
      base
      + base * 0.1 * (level - 1)
      + base * (0.5 * q + d);

    const multiplied = inner * (1 + 0.15 * toku);
    return applyRounding(multiplied, rules.rounding.finalStats);
  }
}

// 丸め方法を切り替える小さな関数
function applyRounding(value: number, mode: 'floor' | 'ceil' | 'round'): number {
  switch (mode) {
    case 'ceil':
      return Math.ceil(value);
    case 'round':
      return Math.round(value);
    case 'floor':
    default:
      return Math.floor(value);
  }
}


