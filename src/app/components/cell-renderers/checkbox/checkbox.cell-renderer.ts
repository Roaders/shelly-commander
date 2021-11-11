import { Component } from '@angular/core';
import { ICellRenderer, ICellRendererParams } from 'ag-grid-community';
import { IActionsGrid, IActionsGridCellRendererParams } from '../../../contracts';
import { isActionUrlRow } from '../../../helpers';

@Component({
    selector: 'checkbox-cell-renderer',
    templateUrl: './checkbox.cell-renderer.html',
})
export class CheckboxCellRenderer implements ICellRenderer {
    private _owner: IActionsGrid | undefined;
    private _params: ICellRendererParams | undefined;

    public agInit(params: IActionsGridCellRendererParams): void {
        this._params = params;
        this._owner = params.owner;
    }

    public refresh(params: IActionsGridCellRendererParams): boolean {
        this._params = params;
        this._owner = params.owner;

        return true;
    }

    public onClick(event: Event) {
        event.preventDefault();

        this._owner?.onEnabledClick(this._params?.data);
    }

    public get value() {
        return this._params?.value;
    }

    public get label() {
        if (this._params != null && isActionUrlRow(this._params?.data)) {
            if (this._params.data.existingUrl != null) {
                return this._params.data.existingUrl != this._params.data.updatedUrl ? 'Update' : 'No Change';
            } else {
                return 'Add';
            }
        }
        return 'Enabled';
    }
}
