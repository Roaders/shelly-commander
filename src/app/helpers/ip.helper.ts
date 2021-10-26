import { Injectable } from '@morgan-stanley/needle';
import { IpGroup, IpRange } from '../contracts';

@Injectable()
export class IpHelper {
    constructor() {
        console.log(`IpHelper`);
    }

    public getIpAddresses(_range: IpRange): string[] {
        return [];
    }

    public getNumericValues(group: IpGroup): number[] {
        if (typeof group === 'number') {
            return [group];
        }

        if (group === '*') {
            group = { min: 0, max: 255 };
        }

        const requiredGroup = {
            min: Math.max(group.min ?? 0, 0),
            max: Math.min(group.min ?? 255, 255),
        };

        return Array(requiredGroup.max - requiredGroup.min).map((_, index) => index + requiredGroup.min);
    }
}
