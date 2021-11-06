import { Component, Input } from '@angular/core';
import { ShellySettings } from '../../contracts';

@Component({
    selector: 'actions-grid',
    templateUrl: './actions-grid.component.html',
})
export class ActionsGridComponent {
    @Input()
    public selectedDevice: ShellySettings | undefined;

    public get displayName(): string | undefined {
        return this.selectedDevice?.name || this.selectedDevice?.device.hostname;
    }
}
