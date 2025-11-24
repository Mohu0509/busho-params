// 武器データの型定義
// - CSV の列を表すプロパティ。未入力の可能性がある項目は `?`（オプショナル）です。
export interface Weapon {
  id: number;
  unitType: string; // 兵種
  name: string;
  series?: string;
  isGacha?: boolean;
  owner?: string; // 所有者（例: 関羽）
  effect?: string; // 付与状態（例: 転倒/浮遊/KB）

  str?: number;
  int?: number;
  vit?: number;
  hp?: number;
}


