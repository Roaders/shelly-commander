import { Component } from '@angular/core';
import { ICellRenderer, ICellRendererParams } from 'ag-grid-community';

@Component({
    selector: 'address-cell-renderer',
    templateUrl: './address.cell-renderer.html',
})
export class AddressCellRenderer implements ICellRenderer {
    private _ipAddress = '-';

    public get ipAddress(): string {
        return this._ipAddress;
    }

    public agInit(params: ICellRendererParams): void {
        this._ipAddress = this.getValueToDisplay(params);
    }

    public refresh(params: ICellRendererParams): boolean {
        this._ipAddress = this.getValueToDisplay(params);

        return true;
    }

    private getValueToDisplay(params: ICellRendererParams) {
        return params.value;
    }
}
