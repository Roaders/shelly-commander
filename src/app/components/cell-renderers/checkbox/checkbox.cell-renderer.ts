import { Component } from '@angular/core';
import { ICellRenderer, ICellRendererParams } from 'ag-grid-community';
import { isActionUrlRow } from '../../../helpers';
import { ActionsGridComponent } from '../../actions-grid/actions-grid.component';

@Component({
    selector: 'checkbox-cell-renderer',
    templateUrl: './checkbox.cell-renderer.html',
})
export class CheckboxCellRenderer implements ICellRenderer {
    private _owner: ActionsGridComponent | undefined;
    private _params: ICellRendererParams | undefined;

    public agInit(params: ICellRendererParams): void {
        this._params = params;
        this._owner = (params as any).owner;
    }

    public refresh(params: ICellRendererParams): boolean {
        this._params = params;
        this._owner = (params as any).owner;

        return true;
    }

    public onClick(event: Event) {
        event.preventDefault();
        console.log(`Clicked`, this._params);

        this._owner?.onEnabledClick(this._params?.data);
    }

    public get value() {
        return this._params?.value;
    }

    public get label() {
        if (isActionUrlRow(this._params?.data)) {
            if (this._params?.data.existingUrl != null) {
                return 'Update';
            } else {
                return 'Add';
            }
        }
        return 'Enabled';
    }
}
