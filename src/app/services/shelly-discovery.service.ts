import { Injectable } from '@morgan-stanley/needle';
import { IpRange } from '../contracts';
import { IpHelper } from '../helpers';

@Injectable()
export class ShellyDiscoveryService {
    constructor(private helper: IpHelper) {
        console.log(`ShellyDiscoveryService`, { helper });
    }

    public scan(range: IpRange): void {
        const ipAddresses = this.helper.getIpAddresses(range);
        console.log(`scanning`, { range, ipAddresses });
    }
}
