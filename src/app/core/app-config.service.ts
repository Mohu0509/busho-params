// アプリ全体の設定（計算ルール）を読み込み＆共有するサービス
// - 起動時に `assets/config/rules.json` を読み込み、メモリにキャッシュします。
// - 他のコンポーネントは `rules$` から購読、または `getCachedRules()` で即時取得できます。
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { Rules } from '@models/rules.model';

@Injectable({ providedIn: 'root' })
export class AppConfigService {
  private rulesSubject = new BehaviorSubject<Rules | null>(null);
  readonly rules$ = this.rulesSubject.asObservable();

  constructor(private readonly http: HttpClient) {}

  // 非同期で rules.json を読み込む（初回呼び出し時にキャッシュを更新）
  async loadRules(): Promise<Rules> {
    const rules = await firstValueFrom(
      this.http.get<Rules>('assets/config/rules.json')
    );
    this.rulesSubject.next(rules);
    return rules;
  }

  // すでに読み込まれていればキャッシュから即時で取得
  getCachedRules(): Rules | null {
    return this.rulesSubject.value;
  }
}


