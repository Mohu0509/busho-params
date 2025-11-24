import { Component } from '@angular/core';
import { IFilterAngularComp } from 'ag-grid-angular';
import { IFilterParams, IDoesFilterPassParams } from 'ag-grid-community';

type HaveFilterValue = 'all' | 'true' | 'false';

@Component({
  selector: 'app-have-boolean-filter',
  standalone: true,
  template: `
    <div style="display:flex; gap:6px; align-items:center; padding:4px 6px;">
      <label style="display:flex; gap:4px; align-items:center;">
        <input type="radio" name="have" [checked]="value==='all'" (change)="onChange('all')" />
        <span>すべて</span>
      </label>
      <label style="display:flex; gap:4px; align-items:center;">
        <input type="radio" name="have" [checked]="value==='true'" (change)="onChange('true')" />
        <span>あり</span>
      </label>
      <label style="display:flex; gap:4px; align-items:center;">
        <input type="radio" name="have" [checked]="value==='false'" (change)="onChange('false')" />
        <span>なし</span>
      </label>
    </div>
  `,
})
export class HaveBooleanFilterComponent implements IFilterAngularComp {
  private params!: IFilterParams;
  value: HaveFilterValue = 'all';

  agInit(params: IFilterParams): void {
    this.params = params;
  }

  isFilterActive(): boolean {
    return this.value !== 'all';
  }

  doesFilterPass(params: IDoesFilterPassParams): boolean {
    if (this.value === 'all') return true;
    const have = !!params.data?.have;
    return this.value === 'true' ? have === true : have === false;
  }

  getModel(): any {
    return this.isFilterActive() ? { value: this.value } : null;
  }

  setModel(model: any): void {
    this.value = (model?.value as HaveFilterValue) ?? 'all';
  }

  onChange(v: HaveFilterValue): void {
    this.value = v;
    this.params.filterChangedCallback();
  }
}

