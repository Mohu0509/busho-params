import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IFilterAngularComp } from 'ag-grid-angular';
import { IFilterParams, IDoesFilterPassParams } from 'ag-grid-community';

type Option = string | number;
type Model = { value: Option | null } | null;

@Component({
  selector: 'app-fixed-set-filter',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="display:flex; gap:6px; align-items:center; padding:4px 6px; flex-wrap:wrap;">
      <label style="display:flex; gap:4px; align-items:center;">
        <input type="radio" name="fixedset" [checked]="value===null" (change)="onChange(null)" />
        <span>すべて</span>
      </label>
      <label *ngFor="let o of options" style="display:flex; gap:4px; align-items:center;">
        <input
          type="radio"
          name="fixedset"
          [checked]="isEqual(value, o)"
          (change)="onChange(o)"
        />
        <span>{{ o }}</span>
      </label>
    </div>
  `,
})
export class FixedSetFilterComponent implements IFilterAngularComp {
  private params!: IFilterParams;
  options: Option[] = [];
  private numericMode = false;
  value: Option | null = null; // null = すべて

  agInit(params: IFilterParams): void {
    this.params = params;
    const fp = (this.params.colDef as any)?.filterParams;
    const fromValues = Array.isArray(fp?.values) ? (fp.values as Option[]) : undefined;
    if (fromValues) {
      this.options = fromValues;
    } else {
      this.options = [];
    }
    this.numericMode = this.options.every(o => typeof o === 'number');
  }

  isFilterActive(): boolean {
    return this.value !== null;
  }

  doesFilterPass(p: IDoesFilterPassParams): boolean {
    if (this.value === null) return true;

    // IFilterParams#getValue で当該列のセル値を取得（推奨）
    let cell: any;
    const getValue = (this.params as any)?.getValue as ((node: any) => any) | undefined;
    if (typeof getValue === 'function') {
      cell = getValue(p.node);
    } else {
      // フォールバック: field から直接参照
      const field = (this.params.colDef as any)?.field as string | undefined;
      cell = field && p.data ? (p.data as any)[field] : undefined;
    }

    if (this.numericMode) {
      const n = Number(cell);
      return !Number.isNaN(n) && n === Number(this.value);
    } else {
      return String(cell) === String(this.value);
    }
  }

  getModel(): Model {
    return this.isFilterActive() ? { value: this.value } : null;
  }

  setModel(model: Model): void {
    this.value = model?.value ?? null;
  }

  onChange(v: Option | null): void {
    this.value = v;
    this.params.filterChangedCallback();
  }

  isEqual(a: Option | null, b: Option): boolean {
    if (a === null) return false;
    return this.numericMode ? Number(a) === Number(b) : String(a) === String(b);
    }
}