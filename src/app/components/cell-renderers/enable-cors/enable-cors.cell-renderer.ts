import { Component } from '@angular/core';
import { ICellRendererParams } from 'ag-grid-community';
import { ResultsGridComponent } from '../../results-grid/results-grid.component';

@Component({
    selector: 'enable-cors-cell-renderer',
    templateUrl: './enable-cors.cell-renderer.html',
})
export class EnableCorsCellRenderer {
    private _owner: ResultsGridComponent | undefined;
    private _ipAddress: string | undefined;

    public get ipAddress(): string | undefined {
        return this._ipAddress;
    }

    public enableCors(): void {
        if (this._ipAddress != null && this._owner != null) {
            this._owner.enableCors(this._ipAddress);
        }
    }

    public agInit(params: ICellRendererParams): void {
        this.saveValues(params);
    }

    public refresh(params: ICellRendererParams): void {
        this.saveValues(params);
    }

    private saveValues(params: ICellRendererParams): void {
        this._owner = (params as any).owner;
        this._ipAddress = params.value;
    }
}
