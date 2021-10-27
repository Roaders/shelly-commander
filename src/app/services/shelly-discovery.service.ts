import { Injectable } from '@morgan-stanley/needle';
import { EMPTY, from, Observable, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { IpRange, ShellyDiscoveryResult, ShellyResponse } from '../contracts';
import { IpHelper } from '../helpers';
import axios from 'axios';

@Injectable()
export class ShellyDiscoveryService {
    constructor(private helper: IpHelper) {}

    public scan(range: IpRange): Observable<ShellyDiscoveryResult> {
        const ipAddresses = this.helper.getIpAddresses(range);

        return from(ipAddresses).pipe(
            mergeMap(
                (address) =>
                    from(
                        axios.get<ShellyResponse>(`http://${address}/shelly`, { timeout: 500 })
                    ).pipe(
                        map(({ data }) => ({ address, shelly: data })),
                        catchError((error) => {
                            switch (error.code) {
                                case 'ECONNABORTED':
                                    return EMPTY;
                            }
                            return of({ address, error });
                        })
                    ),
                5
            )
        );
    }
}
