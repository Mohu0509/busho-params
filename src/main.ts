// アプリのエントリーポイント
// - Angular を起動し、ルートコンポーネント `App` を画面に描画します。
// - AG Grid（表コンポーネント）のコミュニティ版モジュールを登録しています。
import { bootstrapApplication } from '@angular/platform-browser';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import { appConfig } from '@app/app.config';
import { App } from '@app/app';

// AG Grid の機能を有効化（フィルタ/ソートなどの基本機能が使えるようになります）
ModuleRegistry.registerModules([AllCommunityModule]);

// `App` をブートストラップ（起動）する。エラーはコンソールに出力。
bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
