// 現在の計算ルール（`rules.json`）をそのまま表示する簡易ビュー
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppConfigService } from '@core/app-config.service';
import { Rules } from '@models/rules.model';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h3>現在の判定基準（rules.json）</h3>
    <pre style="white-space: pre-wrap;">{{ rulesText() }}</pre>
  `,
})
export class SettingsComponent implements OnInit {
  rulesText = signal<string>('');

  constructor(private readonly config: AppConfigService) {}

  async ngOnInit(): Promise<void> {
    const rules = (this.config.getCachedRules() ?? await this.config.loadRules());
    this.rulesText.set(JSON.stringify(rules, null, 2));
  }
}


