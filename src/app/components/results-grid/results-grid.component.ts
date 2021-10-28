import { Component } from '@angular/core';
import { ColDef, GridOptions } from 'ag-grid-community';
import { interval } from 'rxjs';
import { mergeMap, take, tap } from 'rxjs/operators';
import { discoveredDevicesStorageKey } from '../../constants';
import { DiscoveryMessages, ShellyDiscoveryError, ShellyDiscoveryResult } from '../../contracts';
import { compareAddresses, formatMac } from '../../helpers';
import { ShellyDiscoveryService } from '../../services';
import { AddressCellRenderer } from '../cell-renderers/address/address.cell-renderer';
import { EnableCorsCellRenderer } from '../cell-renderers/enable-cors/enable-cors.cell-renderer';

const defaultColDef: ColDef = {
    sortable: true,
    filter: true,
};

@Component({
    selector: 'results-grid',
    templateUrl: './results-grid.component.html',
    styleUrls: ['./results-grid.component.scss'],
})
export class ResultsGridComponent {
    public discoveredGridOptions: GridOptions = {
        columnDefs: [
            {
                headerName: 'Address',
                valueGetter: (row): string => row.data.address,
                cellRendererFramework: AddressCellRenderer,
                comparator: compareAddresses,
            },
            { headerName: 'Host Name', valueGetter: (row): string => row.data.settings.device.hostname },
            { headerName: 'Name', valueGetter: (row): string => row.data.settings.name },
            { headerName: 'Type', valueGetter: (row): string => row.data.settings.device.type },
            {
                headerName: 'Mac',
                valueGetter: (row): string => row.data.settings.device.mac,
                valueFormatter: (params): string => formatMac(params.value),
            },
        ],
        domLayout: 'autoHeight',
        defaultColDef,
    };

    public possibleGridOptions: GridOptions = {
        columnDefs: [
            {
                headerName: 'Address',
                valueGetter: (row): string => row.data,
                cellRendererFramework: AddressCellRenderer,
                comparator: compareAddresses,
            },
            {
                valueGetter: (row): string => row.data,
                cellRendererFramework: EnableCorsCellRenderer,
                cellRendererParams: { owner: this },
                sortable: false,
                filter: false,
            },
        ],
        domLayout: 'autoHeight',
        defaultColDef,
    };

    private _possibleShellyLookup: Record<string, ShellyDiscoveryError> | undefined = {};
    private _possibleShellyArray: string[] | undefined;

    public get possibleShellies(): string[] | undefined {
        return this._possibleShellyArray;
    }

    private _shellyLookup: Record<string, ShellyDiscoveryResult> | undefined = {};
    private _shellies: ShellyDiscoveryResult[] | undefined;

    public get shellies(): ShellyDiscoveryResult[] | undefined {
        return this._shellies;
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

            this.updateDataProviders();

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
                window.localStorage.setItem(
                    discoveredDevicesStorageKey,
                    JSON.stringify(Object.keys(this._shellyLookup || [])),
                );
                break;

            case 'result':
                this.incrementProgress();
                this._shellyLookup = this._shellyLookup ?? {};
                this._shellyLookup[message.address] = message;
                break;

            case 'error':
                this.incrementProgress();
                if (!message.timeout) {
                    this._possibleShellyLookup = this._possibleShellyLookup ?? {};
                    this._possibleShellyLookup[message.address] = message;
                }
                break;
        }

        this.updateDataProviders();
    }

    private incrementProgress(): void {
        this._progress =
            this._progress != null ? { count: this._progress.count + 1, total: this._progress.total } : undefined;
    }

    private updateDataProviders() {
        this._possibleShellyArray =
            this._possibleShellyLookup == null ? undefined : Object.keys(this._possibleShellyLookup);
        this._shellies = this._shellyLookup == null ? undefined : Object.values(this._shellyLookup);
    }
}

interface IProgress {
    count: number;
    total: number;
}
