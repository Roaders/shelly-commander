import { Component, Input } from '@angular/core';
import { ColumnApi, GridOptions } from 'ag-grid-community';
import { Subscription } from 'rxjs';
import { ShellyAction, ShellyActionRecord, ShellyDiscoveryResult } from '../../contracts';
import { ShellyService } from '../../services';
import { CheckboxCellRenderer } from '../cell-renderers/checkbox/checkbox.cell-renderer';

type MessageType = 'error' | 'message';

type ActionRow = { id: string; name: string; enabled: boolean; action: ShellyAction };

@Component({
    selector: 'actions-grid',
    templateUrl: './actions-grid.component.html',
})
export class ActionsGridComponent {
    private columnApi: ColumnApi | undefined;

    private _actions: ShellyActionRecord | undefined;
    private _edits: Record<string, { enabled: boolean }> = {};

    constructor(private shellyService: ShellyService) {}

    public actionGridOptions: GridOptions = {
        columnDefs: [
            {
                colId: 'nameColumn',
                headerName: 'Name',
                field: 'name',
                valueGetter: (params) => `${params.data.name} (${params.data.action.index})`,
            },
            {
                colId: 'enabledColumn',
                valueGetter: (row): string => row.data.enabled,
                cellRendererFramework: CheckboxCellRenderer,
                cellRendererParams: { owner: this },
            },
        ],
        domLayout: 'autoHeight',
        onGridReady: (event) => {
            this.columnApi = event.columnApi;
            this.sizeColumns();
        },
    };

    private subscription: Subscription | undefined;

    private _actionsList: ActionRow[] | undefined;

    public get actions(): ActionRow[] | undefined {
        return this._actionsList;
    }

    private _messageType: MessageType = 'message';

    public get messageClass(): string {
        return this._messageType == 'message' ? '' : 'alert alert-danger';
    }

    private _message: string | undefined;

    public get message(): string | undefined {
        return this._message;
    }

    private _selectedDevice: ShellyDiscoveryResult | undefined;

    public get selectedDevice(): ShellyDiscoveryResult | undefined {
        return this._selectedDevice;
    }

    @Input()
    public set selectedDevice(value: ShellyDiscoveryResult | undefined) {
        this._selectedDevice = value;
        this._actionsList = undefined;

        if (this.subscription != null) {
            this.subscription.unsubscribe();
            this.subscription = undefined;
        }

        this.displayMessage(undefined);

        if (value != null) {
            this.loadActions(value);
        }
    }

    public get displayName(): string | undefined {
        return this.selectedDevice?.settings.name || this.selectedDevice?.settings.device.hostname;
    }

    private loadActions(selectedDevice: ShellyDiscoveryResult) {
        this.displayMessage('Loading actions...');
        this._edits = {};
        this.subscription = this.shellyService.loadShellyActions(selectedDevice.address).subscribe(
            (actions) => this.onActionsLoaded(actions),
            () => this.displayMessage(`Error loading actions for ${selectedDevice.address}`, 'error'),
        );
    }

    private onActionsLoaded(actions: ShellyActionRecord) {
        this.displayMessage(undefined);
        this._actions = actions;

        this.updateRows();
    }

    public onEnabledClick(data?: ActionRow) {
        if (data == null) {
            return;
        }

        const actionEdits = (this._edits[data.id] = this._edits[data.id] || { enabled: !data.enabled });

        actionEdits.enabled = !data.enabled;

        this.updateRows();
    }

    private displayMessage(message?: string, type: MessageType = 'message') {
        this._message = message;
        this._messageType = type;
    }

    private updateRows() {
        this._actionsList = Object.entries(this._actions || {}).reduce(
            (allActions, [name, currentActions]) => [
                ...allActions,
                ...currentActions.map((currentAction) => this.createActionRow(name, currentAction)),
            ],
            new Array<ActionRow>(),
        );

        this.sizeColumns();
    }

    private sizeColumns() {
        this.columnApi?.autoSizeColumn('nameColumn');
        this.columnApi?.autoSizeColumn('enabledColumn');
    }

    private createActionRow(name: string, action: ShellyAction): ActionRow {
        const id = getActionRowId(name, action);
        const enabled = this._edits[id]?.enabled ?? action.enabled;

        return { name, id, enabled, action };
    }
}

function getActionRowId(name: string, action: ShellyAction): string {
    return `${name}_${action.index}`;
}
