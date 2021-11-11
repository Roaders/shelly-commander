import { IpGroup, IpRange, NumericRange } from '../contracts';

export function compareAddressesWithKnownList(knownDevices: string[]): (one: string, two: string) => number {
    return (one: string, two: string) => {
        const oneKnown = knownDevices.indexOf(one);
        const twoKnown = knownDevices.indexOf(two);
        if (oneKnown && !twoKnown) {
            return 1;
        }
        if (!oneKnown && twoKnown) {
            return -1;
        }

        return compareAddresses(one, two);
    };
}

export function compareAddresses(one: string, two: string): number {
    return parseInt(one.split('.').join('')) - parseInt(two.split('.').join(''));
}

export function getIpAddresses(range: IpRange): string[] {
    return expandRange(range.map(getNumericValues)).map((address) => address.join('.'));
}

export function formatMac(value: string): string {
    return Array.from(value)
        .reduce((groups, character) => {
            let lastGroup = groups[groups.length - 1];

            if (lastGroup == null || lastGroup.length >= 2) {
                lastGroup = [character];
                groups.push(lastGroup);
            } else {
                lastGroup.push(character);
            }

            return groups;
        }, new Array<string[]>())
        .map((group) => group.join(''))
        .join(':');
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
        new Array<number[]>(),
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

const matchSingleIpRegExp = /^\d{1,3}$/;
const matchRangeRegExp = /^\d{1,3}-\d{1,3}$/;

export function isStringValueValid(stringValue: string): boolean {
    if (stringValue === '*') {
        return true;
    }

    return matchSingleIpRegExp.test(stringValue) || matchRangeRegExp.test(stringValue);
}

export function convertToIpGroup(stringValue: string): IpGroup | undefined {
    if (stringValue === '*') {
        return '*';
    }

    if (matchSingleIpRegExp.test(stringValue)) {
        return parseInt(stringValue);
    }

    if (matchRangeRegExp.test(stringValue)) {
        const values = stringValue.split('-') as [string, string];
        return { min: parseInt(values[0]), max: parseInt(values[1]) };
    }

    return undefined;
}

export function isIpGroup(value: unknown): value is IpGroup {
    return (
        value === '*' ||
        typeof value === 'number' ||
        (typeof value === 'object' &&
            (typeof (value as NumericRange).min === 'number' || typeof (value as NumericRange).max === 'number'))
    );
}

export function isIpRange(value: unknown): value is IpRange {
    return Array.isArray(value) && value.every(isIpGroup) && value.length === 4;
}
