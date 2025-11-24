# BariBariData

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.3.6.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

## プロジェクト概要（初心者向け）

このアプリは、CSV から読み込んだ「武将」「武器」のデータをもとに、計算ルール（`assets/config/rules.json`）に従ってステータスを算出・表示するデモです。表の表示には AG Grid を使い、見た目の調整に Tailwind CSS を使っています。

### フォルダ構成の要点
- `src/app/features/roster/`: 武将一覧（編集可能な表）
- `src/app/features/weapons/`: 武器一覧（閲覧用の表）
- `src/app/features/settings/`: 現在の計算ルール表示
- `src/app/data-access/`: モデル・CSV 読み込み・計算サービス
- `src/assets/`: CSV やルール JSON などの静的ファイル

### 主要ファイルの役割
- `src/main.ts`: アプリの入口。Angular/AG Grid を初期化します。
- `src/app/app.ts` + `src/app/app.html`: 画面レイアウトの大枠（ヘッダーや各機能の配置）。
- `src/app/core/app-config.service.ts`: `rules.json` を読み込み、アプリ全体に共有します。
- `src/app/data-access/repositories/csv-data.repository.ts`: CSV を取得して型付きデータに変換します。
- `src/app/data-access/services/compute.service.ts`: ステータス計算ロジックをまとめています。
- `tailwind.config.js` / `postcss.config.js`: スタイル生成の設定。

### はじめ方（クイック）
```bash
npm install
npm run start
# ブラウザで http://localhost:4200 を開く
```

## 開発ルール（AG Grid の前提）

- 本リポジトリは AG Grid の無償（Community）版を前提とします。
  - 依存関係: `ag-grid-angular`, `ag-grid-community`（`ag-grid-enterprise` は含めません）
  - 起動時の登録: `AllCommunityModule` のみを登録します。
- フィルタ機能の方針
  - Community 版で利用可能なフィルタを使用します（`agTextColumnFilter`, `agNumberColumnFilter` など）。
  - 「候補リストから選択する」Set Filter は Enterprise 機能のため使用しません。
  - 完全一致が必要な場合は `filterOptions: ['equals']` を設定します。
- Enterprise 機能（例: Set Filter、ツールパネル等）を使う要件が出た場合の対応
  1) 事前に合意を取り、依存に `ag-grid-enterprise` を追加
  2) `SetFilterModule` 等の必要モジュールを `ModuleRegistry.registerModules([...])` に登録
  3) 対象列の `filter: 'agSetColumnFilter'` への切替を実施

この方針により、無償版の範囲で安定して動作させ、必要になった時点でのみ有償機能へ拡張します。