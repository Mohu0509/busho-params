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
        // 三国志風の落ち着いた配色（翡翠・朱・金・羊皮紙）
        sango: {
          50: '#f8f5ef',
          100: '#efe9db',
          200: '#e2d7bf',
          300: '#d4c4a3',
          600: '#2f6b4f',   // jade
          700: '#24563f',
          800: '#1b4432'
        },
        cinnabar: {
          600: '#b91c1c'
        },
        gold: {
          600: '#b68900'
        },
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

