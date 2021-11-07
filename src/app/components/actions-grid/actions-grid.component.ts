import { Component, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { ShellyActionRecord, ShellyDiscoveryResult } from '../../contracts';
import { ShellyService } from '../../services';

type MessageType = 'error' | 'message';

@Component({
    selector: 'actions-grid',
    templateUrl: './actions-grid.component.html',
})
export class ActionsGridComponent {
    constructor(private shellyService: ShellyService) {}

    private subscription: Subscription | undefined;

    private _actions: ShellyActionRecord | undefined;

    public get actions(): `${string}_${number}`[] | undefined {
        if (this._actions == null) {
            return undefined;
        }
        return Object.entries(this._actions).map(([name, action]) => `${name}_${action.index}` as const);
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
        this._actions = undefined;

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
        this._actions = actions;
    }

    private displayMessage(message?: string, type: MessageType = 'message') {
        this._message = message;
        this._messageType = type;
    }
}
