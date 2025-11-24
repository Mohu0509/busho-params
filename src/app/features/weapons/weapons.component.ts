// 武器一覧を AG Grid で表示するコンポーネント
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef } from 'ag-grid-community';
import { CsvDataRepository } from '@repos/csv-data.repository';
import { Weapon } from '@models/weapon.model';

@Component({
  selector: 'app-weapons',
  standalone: true,
  imports: [CommonModule, AgGridAngular],
  template: `
    <ag-grid-angular
      class="ag-theme-quartz"
      style="width: 100%; height: 50vh;"
      [rowData]="rows()"
      [columnDefs]="columnDefs"
      [defaultColDef]="{ resizable: true, sortable: true, filter: true }"
    />
  `,
})
export class WeaponsComponent implements OnInit {
  rows = signal<Weapon[]>([]);
  columnDefs: ColDef<Weapon>[] = [
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'unitType', headerName: '兵種', width: 100 },
    { field: 'name', headerName: '武器名', width: 180 },
    { field: 'series', headerName: 'シリーズ', width: 100 },
    { field: 'owner', headerName: '所有者', width: 140 },
    { field: 'effect', headerName: '状態', width: 100 },
    { field: 'str', headerName: '武', width: 80 },
    { field: 'int', headerName: '知', width: 80 },
    { field: 'vit', headerName: '耐', width: 80 },
    { field: 'hp', headerName: '体', width: 80 },
  ];

  constructor(private readonly repo: CsvDataRepository) {}

  async ngOnInit(): Promise<void> {
    const weapons = await this.repo.loadWeapons();
    this.rows.set(weapons);
  }
}


