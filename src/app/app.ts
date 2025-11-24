// アプリ全体のルートコンポーネント
// - 画面上部の `app.html`（テンプレート）に、各機能コンポーネントを配置します。
// - `signal` は Angular のリアクティブな状態管理の仕組み（簡易な状態を持つのに便利）。
import { Component, signal } from '@angular/core';
import { RosterComponent } from '@features/roster/roster.component';
import { WeaponsComponent } from '@features/weapons/weapons.component';
import { SettingsComponent } from '@features/settings/settings.component';

@Component({
  selector: 'app-root',
  imports: [RosterComponent, WeaponsComponent, SettingsComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  // 画面タイトルなどの簡単な状態を `signal` で保持
  protected readonly title = signal('bari-bari-data');
}
