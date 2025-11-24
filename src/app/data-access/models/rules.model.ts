// 計算ルールの型定義（`assets/config/rules.json` の形と一致）
export type RoundingMode = 'floor' | 'ceil' | 'round';

export interface Rules {
  defaults: {
    level: number;
    toku: number;
  };
  limits: {
    level: { min: number; max: number };
    toku: { min: number; max: number };
  };
  rounding: {
    finalStats: RoundingMode;
  };
  levelFactor: {
    hundredsRule: boolean;
  };
}


