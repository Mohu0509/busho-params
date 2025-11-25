import { ComputeService } from './compute.service';
import { Rules } from '../models/rules.model';

describe('ComputeService', () => {
  const service = new ComputeService();
  const rules: Rules = {
    defaults: { level: 50, toku: 4 },
    limits: { level: { min: 1, max: 100 }, toku: { min: 0, max: 5 } },
    rounding: { finalStats: 'floor' },
    levelFactor: { hundredsRule: true },
  };

  it('should compute final stat with generic rule', () => {
    const base = 100;
    const level = 50; // q=5
    const toku = 4;
    const q = Math.floor(level / 10);
    const d = 0; // level 100 ではないため特例なし
    const inner = base + base * 0.1 * (level - 1) + base * (0.5 * q + d);
    const expected = Math.floor(inner * (1 + 0.15 * toku));
    expect(service.computeFinalStat(base, level, toku, rules)).toBe(expected);
  });

  it('should apply hundredsRule at level 100 and toku < 5', () => {
    const base = 200;
    const level = 100; // q=10
    const toku = 4; // <5 triggers (q-1)
    const q = Math.floor(level / 10);
    const d = -0.5; // 100 特例
    const inner = base + base * 0.1 * (level - 1) + base * (0.5 * q + d);
    const expected = Math.floor(inner * (1 + 0.15 * toku));
    expect(service.computeFinalStat(base, level, toku, rules)).toBe(expected);
  });
});


