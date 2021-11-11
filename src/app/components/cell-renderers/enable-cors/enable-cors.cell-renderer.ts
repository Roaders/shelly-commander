import { Component } from '@angular/core';
import { ICellRenderer, ICellRendererParams } from 'ag-grid-community';
import { IResultsGrid, IResultsGridRendererParams } from '../../../contracts';

@Component({
    selector: 'enable-cors-cell-renderer',
    templateUrl: './enable-cors.cell-renderer.html',
})
export class EnableCorsCellRenderer implements ICellRenderer {
    private _owner: IResultsGrid | undefined;
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

    public refresh(params: ICellRendererParams): boolean {
        this.saveValues(params);

        return true;
    }

    private saveValues(params: IResultsGridRendererParams): void {
        this._owner = params.owner;
        this._ipAddress = params.value;
    }
}
