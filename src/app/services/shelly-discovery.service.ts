import { Injectable } from '@morgan-stanley/needle';
import { from, Observable, of, Subject, Subscription } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import {
    DiscoveryMessages,
    IpRange,
    ShellyDiscoveryError,
    ShellyDiscoveryResult,
    ShellyInfo,
    ShellySettings,
} from '../contracts';
import { IpHelper } from '../helpers';
import axios from 'axios';

@Injectable()
export class ShellyDiscoveryService {
    constructor(private helper: IpHelper) {}

    private subscription: Subscription | undefined;

    private readonly resultsSubject = new Subject<DiscoveryMessages>();

    public get resultsStream(): Observable<DiscoveryMessages> {
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

    public scan(range: IpRange): void {
        const addresses = this.helper.getIpAddresses(range);

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
                () =>
                    this.resultsSubject.next({
                        type: 'streamComplete',
                    }),
            );
    }
}
