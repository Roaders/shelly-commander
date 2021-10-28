import { Component } from '@angular/core';
import { interval } from 'rxjs';
import { mergeMap, take, tap } from 'rxjs/operators';
import { DiscoveryMessages, ShellyDiscoveryError, ShellyDiscoveryResult } from '../../contracts';
import { ShellyDiscoveryService } from '../../services';

@Component({
    selector: 'results-grid',
    templateUrl: './results-grid.component.html',
    styleUrls: ['./results-grid.component.scss'],
})
export class ResultsGridComponent {
    private _possibleShellyLookup: Record<string, ShellyDiscoveryError> | undefined = {};

    public get possibleShellies(): string[] | undefined {
        return this._possibleShellyLookup == null ? undefined : Object.keys(this._possibleShellyLookup);
    }

    private _shellyLookup: Record<string, ShellyDiscoveryResult> | undefined = {};

    public get shellies(): ShellyDiscoveryResult[] | undefined {
        return this._shellyLookup == null ? undefined : Object.values(this._shellyLookup);
    }

    private _progress: IProgress | undefined;

    public get progress(): IProgress | undefined {
        return this._progress;
    }

    private _scanStarted = false;

    public get scanStarted(): boolean {
        return this._scanStarted;
    }

    constructor(private discoveryService: ShellyDiscoveryService) {
        discoveryService.resultsStream.subscribe((message) => this.handleStreamResult(message));
    }

    public enableCors(address: string): void {
        console.log(`enableCors`, { address });
        const corsWindow = window.open(
            `http://${address}/settings?allow_cross_origin=true`,
            '_blank',
            'width=400,height=400',
        );

        if (corsWindow != null) {
            if (this._possibleShellyLookup != null) {
                delete this._possibleShellyLookup[address];
            }
            if (this._shellyLookup != null) {
                delete this._shellyLookup[address];
            }

            interval(500)
                .pipe(
                    take(1),
                    tap(() => corsWindow.close()),
                    mergeMap(() => this.discoveryService.loadShellyDetails(address)),
                )
                .subscribe((message) => this.handleStreamResult(message));
        }
    }

    private handleStreamResult(message: DiscoveryMessages) {
        switch (message.type) {
            case 'startStream':
                this._progress = { total: message.addresses.length, count: 0 };
                this._scanStarted = true;
                this._possibleShellyLookup = undefined;
                this._shellyLookup = undefined;
                break;

            case 'streamComplete':
                this._progress = undefined;
                break;

            case 'result':
                this.incrementProgress();
                this._shellyLookup = this._shellyLookup ?? {};
                this._shellyLookup[message.address] = message;
                console.log(`result`, message);
                break;

            case 'error':
                this.incrementProgress();
                if (!message.timeout) {
                    this._possibleShellyLookup = this._possibleShellyLookup ?? {};
                    this._possibleShellyLookup[message.address] = message;
                }
                break;
        }

        console.log(`handleStreamResult`, message);
    }

    private incrementProgress(): void {
        this._progress =
            this._progress != null ? { count: this._progress.count + 1, total: this._progress.total } : undefined;
    }
}

interface IProgress {
    count: number;
    total: number;
}
