import { Component } from '@angular/core';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent {
    public getIpRange(range: unknown): void {
        console.log(`getIpRange`, range);
    }
}
