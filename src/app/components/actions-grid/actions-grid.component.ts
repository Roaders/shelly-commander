import { Component, Input } from '@angular/core';
import { GridOptions } from 'ag-grid-community';
import { Subscription } from 'rxjs';
import { ShellyAction, ShellyActionRecord, ShellyDiscoveryResult } from '../../contracts';
import { ShellyService } from '../../services';

type MessageType = 'error' | 'message';

@Component({
    selector: 'actions-grid',
    templateUrl: './actions-grid.component.html',
})
export class ActionsGridComponent {
    constructor(private shellyService: ShellyService) {}

    public actionGridOptions: GridOptions = {
        columnDefs: [
            {
                valueGetter: (row): string => row.data.action.enabled,
                width: 100,
            },
            {
                headerName: 'Name',
                field: 'name',
            },
            {
                headerName: 'Index',
                valueGetter: (row): string => row.data.action.index,
                width: 100,
            },
        ],
        domLayout: 'autoHeight',
    };

    private subscription: Subscription | undefined;

    private _actionsList: { name: string; action: ShellyAction }[] | undefined;

    public get actions(): { name: string; action: ShellyAction }[] | undefined {
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
        console.log(`Loading actions: ${selectedDevice.address}`);
        this.displayMessage('Loading actions...');
        this.subscription = this.shellyService.loadShellyActions(selectedDevice.address).subscribe(
            (actions) => this.onActionsLoaded(actions),
            () => this.displayMessage(`Error loading actions for ${selectedDevice.address}`, 'error'),
        );
    }

    private onActionsLoaded(actions: ShellyActionRecord) {
        this.displayMessage(undefined);

        this._actionsList = Object.entries(actions).reduce(
            (allActions, [name, currentActions]) => [
                ...allActions,
                ...currentActions.map((currentAction) => ({ name, action: currentAction })),
            ],
            new Array<{ name: string; action: ShellyAction }>(),
        );
    }

    private displayMessage(message?: string, type: MessageType = 'message') {
        this._message = message;
        this._messageType = type;
    }
}
