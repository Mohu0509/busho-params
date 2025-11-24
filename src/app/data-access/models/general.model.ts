// 武将データの型定義
// - CSV の各列をわかりやすい名前にマッピングしたものです。
export interface General {
  no: number;
  camp: string;
  meisho: boolean;
  name: string;

  strInit: number;
  intInit: number;
  vitInit: number;
  hpInit: number;

  g1?: string;
  g2?: string;
  g3?: string;
  g4?: string;
  g5?: string;
  g6?: string;
  g7?: string;

  stateAngry?: string;
  stateNormal?: string;
  stateFollowPre?: string;
  stateFollowPost?: string;
}

export interface UnitState {
  // ユーザーが所持しているか（UI で切り替え）
  have: boolean;
  // レベル（ルールの範囲で制限）
  level: number;
  // 突数（0～5）
  toku: number;
  // 装備中の武器 ID（未装備は null）
  equipWeaponId: number | null;
}

export interface GeneralRow extends General, UnitState {}


