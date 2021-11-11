import { Component } from '@angular/core';
import { ShellyDiscoveryResult } from '../../contracts';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent {
    public selectedDevice: ShellyDiscoveryResult | undefined;
}
