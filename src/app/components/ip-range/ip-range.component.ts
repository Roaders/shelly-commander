import { Component } from '@angular/core';
import { ShellyDiscoveryService } from '../../services';

@Component({
    selector: 'ip-range',
    templateUrl: './ip-range.component.html',
    styleUrls: ['./ip-range.component.scss'],
})
export class IpRangeComponent {
    constructor(discoveryService: ShellyDiscoveryService) {
        discoveryService.scan([192, 168, 86, '*']);
    }
}
