import { Component, Input } from '@angular/core';
import { ColumnApi, GridOptions } from 'ag-grid-community';
import { Subscription } from 'rxjs';
import {
    ActionRow,
    ActionURLRow,
    IActionsGrid,
    ShellyAction,
    ShellyActionRecord,
    ShellyDiscoveryResult,
} from '../../contracts';
import { isActionRow, isActionUrlRow } from '../../helpers';
import { ShellyService } from '../../services';
import { CheckboxCellRenderer } from '../cell-renderers/checkbox/checkbox.cell-renderer';
import format from 'string-template';

type MessageType = 'error' | 'message';

type StringTemplateVariables = {
    deviceName: string;
    deviceHostName: string;
    deviceMac: string;
    deviceType: string;
    action: string;
    index: string;
};

@Component({
    selector: 'actions-grid',
    templateUrl: './actions-grid.component.html',
})
export class ActionsGridComponent implements IActionsGrid {
    private columnApi: ColumnApi | undefined;

    private _actions: ShellyActionRecord | undefined;
    private _edits: Record<string, { enabled: boolean; updateUrls: boolean[] }> = {};

    constructor(private shellyService: ShellyService) {}

    private _urlTemplate = 'http://192.168.0.1/api?device={deviceName}&action={action}&index={index}';

    public get urlTemplate(): string {
        return this._urlTemplate;
    }

    public set urlTemplate(value: string) {
        this._urlTemplate = value;

        this.updateRows();
        this.updateHasEdits();
    }

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
                valueGetter: (row): boolean | undefined => rowIsEnabled(row.data),
                cellRendererFramework: CheckboxCellRenderer,
                cellRendererParams: { owner: this },
            },
            {
                colId: 'existingUrl',
                headerName: 'Existing Url',
                valueGetter: (row): string | undefined =>
                    isActionUrlRow(row.data) ? row.data.existingUrl ?? 'Undefined' : undefined,
                tooltipValueGetter: (row): string => (isActionUrlRow(row.data) ? row.data.existingUrl ?? '' : ''),
                flex: 1,
                resizable: true,
            },
            {
                colId: 'updatedUrl',
                headerName: 'Updated Url',
                valueGetter: (row): string | undefined => (isActionUrlRow(row.data) ? row.data.updatedUrl : undefined),
                tooltipValueGetter: (row): string => (isActionUrlRow(row.data) ? row.data.updatedUrl : ''),
                flex: 1,
                resizable: true,
            },
        ],
        enableCellTextSelection: true,
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

    public onEnabledClick(data: unknown) {
        if (data == null) {
            return;
        }

        if (isActionRow(data)) {
            const actionEdits = (this._edits[data.id] = this._edits[data.id] || {
                enabled: !data.enabled,
                updateUrls: [],
            });

            actionEdits.enabled = !data.enabled;
        } else if (isActionUrlRow(data)) {
            const actionId = getActionRowId(data.actionName, data.action);
            const actionEdits = (this._edits[actionId] = this._edits[actionId] || {
                enabled: data.action.enabled,
                updateUrls: [],
            });

            actionEdits.updateUrls[data.index] = !data.updateValue;
        } else {
            throw new Error(`Unknown row type: ${JSON.stringify(data)}`);
        }

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
        this._hasEdits = reduceActions(this._actions || {}).some((row) => {
            const { name, action } = row;
            const id = getActionRowId(name, action);
            const edits = this._edits[id];

            if (edits == null) {
                return false;
            }

            if (row.type === 'actionRow') {
                return edits.enabled != action.enabled;
            } else if (row.type === 'actionURLRow') {
                return edits.updateUrls[row.index] && (row.url == null || row.url != this.generateUrl(row));
            }

            return false;
        });
    }

    private generateUrl(row: ExpandedActionURLRow): string {
        const device = this.selectedDevice;

        if (device == null) {
            throw new Error(`Attempted to generate url when there was no selected device`);
        }

        const variables: StringTemplateVariables = {
            action: encodeURIComponent(row.name),
            deviceName: encodeURIComponent(device.settings?.name),
            deviceHostName: encodeURIComponent(device.settings.device.hostname),
            index: encodeURIComponent(row.action.index.toString()),
            deviceMac: encodeURIComponent(device.settings.device.mac),
            deviceType: encodeURIComponent(device.settings.device.type),
        };

        return format(this._urlTemplate, variables);
    }

    private sizeColumns() {
        this.columnApi?.autoSizeColumn('nameColumn');
        this.columnApi?.autoSizeColumn('enabledColumn');
    }

    private createGridRow(expandedRow: ExpandedRow): ActionRow | ActionURLRow {
        const { action, name } = expandedRow;
        const actionId = getActionRowId(name, action);
        const actionEdits = this._edits[actionId];

        if (expandedRow.type === 'actionRow') {
            const enabled = actionEdits?.enabled ?? action.enabled;

            return { name, id: actionId, enabled, action, rowType: 'actionRow' };
        } else if (expandedRow.type === 'actionURLRow') {
            const id = getUrlActionRowId(name, action, expandedRow.index);
            const index = expandedRow.index;
            const updateValue = actionEdits?.updateUrls[index] ?? false;

            return {
                id,
                updateValue,
                rowType: 'actionURLRow',
                index,
                updatedUrl: this.generateUrl(expandedRow),
                existingUrl: expandedRow.url,
                actionName: name,
                action,
            };
        }

        throw new Error(`Unknown row type: ${JSON.stringify(expandedRow)}`);
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

function getUrlActionRowId(name: string, action: ShellyAction, index: number): string {
    return `${getActionRowId(name, action)}_${index}`;
}

function rowIsEnabled(row: unknown): boolean | undefined {
    if (isActionRow(row)) {
        return row.enabled;
    } else if (isActionUrlRow(row)) {
        return row.existingUrl == null || row.existingUrl != row.updatedUrl ? row.updateValue : undefined;
    }

    return undefined;
}
