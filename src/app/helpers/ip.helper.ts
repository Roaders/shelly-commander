import { Injectable } from '@morgan-stanley/needle';
import { IpGroup, IpRange } from '../contracts';

@Injectable()
export class IpHelper {
    public getIpAddresses(range: IpRange): string[] {
        return expandRange(range.map(getNumericValues)).map((address) => address.join('.'));
    }
}

export function expandRange(expander: number[][], existing?: number[][]): number[][] {
    const nextRange = expander.shift();

    if (nextRange == null) {
        return existing ?? [];
    }

    if (existing == null) {
        existing = nextRange.map((value) => [value]);
        return expandRange(expander, existing);
    }

    existing = existing.reduce(
        (all, existingValue) => [...all, ...nextRange.map((newValue) => [...existingValue, newValue])],
        new Array<number[]>()
    );

    return expandRange(expander, existing);
}

export function getNumericValues(group: IpGroup): number[] {
    if (typeof group === 'number') {
        return [group];
    }

    if (group === '*') {
        group = { min: 0, max: 255 };
    }

    const requiredGroup = {
        min: Math.max(group.min ?? 0, 0),
        max: Math.min(group.max ?? 255, 255),
    };

    const length = requiredGroup.max - requiredGroup.min + 1;

    return Array.from({ length }).map((_, index) => index + requiredGroup.min);
}
