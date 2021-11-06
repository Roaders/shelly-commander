import { Component } from '@angular/core';
import { ShellySettings } from '../../contracts';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent {
    public selectedDevice: ShellySettings | undefined;
}
