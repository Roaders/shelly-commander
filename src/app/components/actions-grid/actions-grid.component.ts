import { Component, Input } from '@angular/core';
import { ColumnApi, GridOptions } from 'ag-grid-community';
import { Subscription } from 'rxjs';
import { ActionRow, ActionURLRow, ShellyAction, ShellyActionRecord, ShellyDiscoveryResult } from '../../contracts';
import { isActionRow, isActionUrlRow } from '../../helpers';
import { ShellyService } from '../../services';
import { CheckboxCellRenderer } from '../cell-renderers/checkbox/checkbox.cell-renderer';

type MessageType = 'error' | 'message';

@Component({
    selector: 'actions-grid',
    templateUrl: './actions-grid.component.html',
})
export class ActionsGridComponent {
    private columnApi: ColumnApi | undefined;

    private _actions: ShellyActionRecord | undefined;
    private _edits: Record<string, { enabled: boolean }> = {};

    constructor(private shellyService: ShellyService) {}

    public readonly actionGridOptions: GridOptions = {
        columnDefs: [
            {
                colId: 'nameColumn',
                headerName: 'Name',
                field: 'name',
                valueGetter: (params) =>
                    isActionRow(params.data) ? `${params.data.name} (${params.data.action.index})` : undefined,
            },
            {
                colId: 'enabledColumn',
                valueGetter: (row): boolean => rowIsEnabled(row.data),
                cellRendererFramework: CheckboxCellRenderer,
                cellRendererParams: { owner: this },
            },
            {
                colId: 'existingUrl',
                headerName: 'Existing Url',
                valueGetter: (row): string | undefined => (isActionUrlRow(row.data) ? row.data.existingUrl : undefined),
            },
            {
                colId: 'updatedUrl',
                headerName: 'Updated Url',
                valueGetter: (row): string | undefined => (isActionUrlRow(row.data) ? row.data.updatedUrl : undefined),
            },
        ],
        domLayout: 'autoHeight',
        onGridReady: (event) => {
            this.columnApi = event.columnApi;
            this.sizeColumns();
        },
    };

    private subscription: Subscription | undefined;

    private _actionsList: (ActionRow | ActionURLRow)[] | undefined;

    public get actionsList(): (ActionRow | ActionURLRow)[] | undefined {
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

    private _hasEdits = false;

    public get hasEdits(): boolean {
        return this._hasEdits;
    }

    public get displayName(): string | undefined {
        return this.selectedDevice?.settings.name || this.selectedDevice?.settings.device.hostname;
    }

    private loadActions(selectedDevice: ShellyDiscoveryResult) {
        this.reset();
        this.displayMessage('Loading actions...');

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
        this.updateHasEdits();
    }

    private displayMessage(message?: string, type: MessageType = 'message') {
        this._message = message;
        this._messageType = type;
    }

    private updateRows() {
        this._actionsList = reduceActions(this._actions || {}).map((expandedRow) => this.createGridRow(expandedRow));

        this.sizeColumns();
    }

    private updateHasEdits() {
        this._hasEdits = reduceActions(this._actions || {}).some(({ name, action }) => {
            const id = getActionRowId(name, action);
            const edits = this._edits[id];
            return edits != null && edits.enabled != action.enabled;
        });
    }

    private sizeColumns() {
        this.columnApi?.autoSizeColumn('nameColumn');
        this.columnApi?.autoSizeColumn('enabledColumn');
    }

    private createGridRow(expandedRow: ExpandedRow): ActionRow | ActionURLRow {
        const { action, name } = expandedRow;
        if (expandedRow.type === 'actionRow') {
            const id = getActionRowId(name, action);
            const enabled = this._edits[id]?.enabled ?? action.enabled;

            return { name, id, enabled, action, rowType: 'actionRow' };
        } else if (expandedRow.type === 'actionURLRow') {
            const id = getActionRowId(name, action);
            const updateValue = this._edits[id]?.enabled ?? action.enabled;

            return {
                id,
                updateValue,
                rowType: 'actionURLRow',
                index: expandedRow.index,
                updatedUrl: 'updatedUrl',
                existingUrl: expandedRow.url,
            };
        }

        throw new Error(`Unknown row type: ${(expandedRow as any).type}`);
    }

    private reset() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
        this.subscription = undefined;
        this._edits = {};
        this._actions = undefined;
        this._actionsList = undefined;
        this._message = undefined;
        this._messageType = 'message';
        this._hasEdits = false;
    }
}

type ExpandedActionRow = { type: 'actionRow'; name: string; action: ShellyAction };
type ExpandedActionURLRow = {
    type: 'actionURLRow';
    name: string;
    action: ShellyAction;
    index: number;
    url: string | undefined;
};
type ExpandedRow = ExpandedActionRow | ExpandedActionURLRow;

function reduceActions(actions: ShellyActionRecord): ExpandedRow[] {
    return Object.entries(actions).reduce(
        (allActions, [name, currentActions]) => [
            ...allActions,
            ...currentActions.reduce(
                (actionUrls, action) => [...actionUrls, ...reduceActionUrls(name, action)],
                new Array<ExpandedRow>(),
            ),
        ],
        new Array<ExpandedRow>(),
    );
}

function reduceActionUrls(name: string, action: ShellyAction): ExpandedRow[] {
    const rows = [
        { type: 'actionRow' as const, name, action },
        ...action.urls.map((url, index) => createExpandedUrlRow(name, action, index, url)),
    ];

    if (action.urls.length < 5) {
        rows.push(createExpandedUrlRow(name, action, action.urls.length, undefined));
    }

    return rows;
}

function createExpandedUrlRow(
    name: string,
    action: ShellyAction,
    index: number,
    url: string | undefined,
): ExpandedActionURLRow {
    return { type: 'actionURLRow' as const, name, action, url, index };
}

function getActionRowId(name: string, action: ShellyAction): string {
    return `${name}_${action.index}`;
}

function rowIsEnabled(row: ActionRow): boolean {
    return isActionRow(row) ? row.enabled : false;
}
