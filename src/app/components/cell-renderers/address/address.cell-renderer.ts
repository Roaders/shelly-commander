import { Component } from '@angular/core';
import { ICellRendererParams } from 'ag-grid-community';

@Component({
    selector: 'address-cell-renderer',
    templateUrl: './address.cell-renderer.html',
})
export class AddressCellRenderer {
    private _ipAddress = '-';

    public get ipAddress(): string {
        return this._ipAddress;
    }

    public agInit(params: ICellRendererParams): void {
        this._ipAddress = this.getValueToDisplay(params);
    }

    public refresh(params: ICellRendererParams): void {
        this._ipAddress = this.getValueToDisplay(params);
    }

    private getValueToDisplay(params: ICellRendererParams) {
        return params.value;
    }
}
