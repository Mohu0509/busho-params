/** Tailwind CSS の設定ファイル
 * - content: ユーティリティクラスを検索する対象（未使用クラスを削除して CSS を軽量化）
 * - theme.extend: カラーなどのデザイントークンを追加
 * - plugins: 追加プラグイン（本プロジェクトでは未使用）
 * @type {import('tailwindcss').Config}
 */
module.exports = {
  // `src/` 配下の HTML/TS からユーティリティクラスを抽出
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        // 共通で使うブランドカラー（任意に拡張可能）
        brand: {
          50: '#eef6ff',
          100: '#d9ebff',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb'
        }
      }
    }
  },
  plugins: []
};

