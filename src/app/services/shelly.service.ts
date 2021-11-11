import { Injectable } from '@morgan-stanley/needle';
import { from, Observable, of, Subject, Subscription } from 'rxjs';
import { catchError, map, mergeMap, toArray } from 'rxjs/operators';
import {
    DiscoveryMessages,
    IpRange,
    ShellyAction,
    ShellyActionRecord,
    ShellyActionsResult,
    ShellyDiscoveryError,
    ShellyDiscoveryResult,
    ShellyInfo,
    ShellySettings,
} from '../contracts';
import axios from 'axios';
import { compareAddressesWithKnownList, getIpAddresses } from '../helpers';
import { discoveredDevicesStorageKey } from '../constants';

@Injectable()
export class ShellyService {
    private subscription: Subscription | undefined;

    private readonly resultsSubject = new Subject<DiscoveryMessages>();

    public get discoveryStream(): Observable<DiscoveryMessages> {
        return this.resultsSubject.asObservable();
    }

    public loadShellyDetails(address: string): Observable<ShellyDiscoveryError | ShellyDiscoveryResult> {
        return from(
            axios.get<ShellyInfo>(`http://${address}/shelly`, { timeout: 500 }),
        ).pipe(
            map(({ data }) => data),
            mergeMap((info) =>
                from(axios.get<ShellySettings>(`http://${address}/settings`)).pipe(
                    map(({ data }) => ({ settings: data, info })),
                ),
            ),
            map(({ settings, info }) => {
                const response: ShellyDiscoveryResult = {
                    type: 'result',
                    address,
                    info,
                    settings,
                };

                return response;
            }),
            catchError((error) => {
                return of<ShellyDiscoveryError>({
                    type: 'error',
                    address,
                    error,
                    timeout: error.code === 'ECONNABORTED',
                });
            }),
        );
    }

    public loadShellyActions(address: string): Observable<ShellyActionRecord> {
        return from(axios.get<ShellyActionsResult>(`http://${address}/settings/actions`)).pipe(
            map((result) => result.data.actions),
        );
    }

    public scan(range: IpRange): void {
        const knownDevices: string[] = JSON.parse(window.localStorage.getItem(discoveredDevicesStorageKey) || '[]');
        const addresses = getIpAddresses(range).sort(compareAddressesWithKnownList(knownDevices));

        if (this.subscription != null) {
            this.subscription.unsubscribe();
        }

        this.resultsSubject.next({
            type: 'startStream',
            addresses,
        });

        this.subscription = from(addresses)
            .pipe(mergeMap((address) => this.loadShellyDetails(address), 10))
            .subscribe(
                (next) => this.resultsSubject.next(next),
                (error) => this.resultsSubject.error(error),
                () => {
                    this.resultsSubject.next({
                        type: 'streamComplete',
                    });
                },
            );
    }

    public updateDeviceActions(address: string, actions: ShellyActionRecord): Observable<ShellyActionRecord> {
        console.log(`updateDeviceActions`, { address, actions });

        const flattenedActions = Object.entries(actions).reduce(
            (actions, [name, channels]) => [...actions, ...channels.map((action) => ({ name, action }))],
            new Array<{ name: string; action: ShellyAction }>(),
        );

        return from(flattenedActions).pipe(
            mergeMap(({ name, action }) => this.updateShellyActionUrls(address, name, action), 1),
            toArray(),
            mergeMap(() => this.loadShellyActions(address)),
        );
    }

    public updateShellyActionUrls(address: string, name: string, action: ShellyAction): Observable<ShellyActionRecord> {
        const urlParams = action.urls.map((url) => `urls[]=${encodeURIComponent(url)}`).join('&');
        return from(
            axios.get<ShellyActionsResult>(
                `http://${address}/settings/actions?index=${action.index}&name=${name}&enabled=${action.enabled}&${urlParams}`,
            ),
        ).pipe(map((result) => result.data.actions));
    }
}
