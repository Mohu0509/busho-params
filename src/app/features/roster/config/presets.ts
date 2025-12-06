// プリセット（上部ボタン）の定義を一箇所に集約
// - キーはボタンに表示する文言
// - 値は General 型の g1～g13 のどれに対応するか
// これを変更すれば、ボタン表示とフィルタ対象が同時に更新されます
export const presetKeyMap = {
  '地上': 'g1',
  '五虎': 'g2',
  '龍舞': 'g3',
  '火鳳': 'g4',
  '孫劉': 'g5',
  '龍吟': 'g6',
  '富甲': 'g7',
  '智掌': 'g8',
  'ｼﾘｳｽ': 'g9',
  'ﾓﾔﾓﾔ': 'g10',
  '君臨': 'g11',
  '傾城': 'g12',
  '北玄': 'g13',
} as const;

// ボタンの表示順（presetKeyMap のキー配列）
export const presetList = Object.keys(presetKeyMap) as Array<keyof typeof presetKeyMap>;


