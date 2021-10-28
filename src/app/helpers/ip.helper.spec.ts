import { IpGroup, IpRange } from '../contracts';
import { expandRange, formatMac, getIpAddresses, getNumericValues } from './ip.helper';

describe(`ip.helper`, () => {
    describe(`getIpAddresses`, () => {
        const tests: { range: IpRange; expected: string[]; expectedCount?: number }[] = [
            { range: [192, 168, 0, '*'], expectedCount: 256, expected: ['192.168.0.0', '192.168.0.255'] },
            {
                range: [192, 168, 0, { max: 5 }],
                expected: ['192.168.0.0', '192.168.0.1', '192.168.0.2', '192.168.0.3', '192.168.0.4', '192.168.0.5'],
            },
            {
                range: [192, 168, { min: 4, max: 5 }, { min: 44, max: 45 }],
                expected: ['192.168.4.44', '192.168.4.45', '192.168.5.44', '192.168.5.45'],
            },
        ];

        tests.forEach(({ range, expected, expectedCount }) => {
            const expectedMessage = expectedCount == null ? `[${expected}]` : `${expectedCount} addresses`;

            it(`should return ${expectedMessage} when passed ${JSON.stringify(range)}`, () => {
                const result = getIpAddresses(range);

                if (expectedCount != null) {
                    expect(result.length).toBe(expectedCount);
                    expected.forEach((expectedAddress) => {
                        expect(result.indexOf(expectedAddress) >= 0);
                    });
                } else {
                    expect(result).toEqual(result);
                }
            });
        });
    });

    describe('expandRange', () => {
        const tests: { expander: number[][]; expected: number[][] }[] = [
            { expander: [[123]], expected: [[123]] },
            { expander: [[123, 456]], expected: [[123], [456]] },
            { expander: [[123], [456]], expected: [[123, 456]] },
            {
                expander: [[123, 456], [789]],
                expected: [
                    [123, 789],
                    [456, 789],
                ],
            },
            {
                expander: [[123], [456, 789]],
                expected: [
                    [123, 456],
                    [123, 789],
                ],
            },
            {
                expander: [
                    [123, 456],
                    [789, 654],
                ],
                expected: [
                    [123, 789],
                    [123, 654],
                    [456, 789],
                    [456, 654],
                ],
            },
        ];

        tests.forEach(({ expander, expected }) => {
            it(`when passed ${JSON.stringify(expander)} it should return ${JSON.stringify(expected)}`, () => {
                const result = expandRange(expander);

                expect(result).toEqual(expected);
            });
        });
    });

    describe('getNumericValues', () => {
        const tests: { group: IpGroup; expected: number[] }[] = [
            { group: '*', expected: Array.from({ length: 256 }).map((_, index) => index) },
            {
                group: { min: -5 },
                expected: Array.from({ length: 256 }).map((_, index) => index),
            },
            {
                group: { max: 300 },
                expected: Array.from({ length: 256 }).map((_, index) => index),
            },
            { group: 123, expected: [123] },
            { group: { min: 250 }, expected: [250, 251, 252, 253, 254, 255] },
            { group: { max: 5 }, expected: [0, 1, 2, 3, 4, 5] },
            { group: { min: 5, max: 10 }, expected: [5, 6, 7, 8, 9, 10] },
        ];

        tests.forEach(({ group, expected }) => {
            it(`should return [${expected}] when passed ${JSON.stringify(group)}`, () => {
                const result = getNumericValues(group);

                expect(result).toEqual(expected);
            });
        });
    });

    describe(`formatMac`, () => {
        it(`should format a string and place : to split the groups`, () => {
            expect(formatMac(`12AB34CD`)).toBe(`12:AB:34:CD`);
        });
    });
});
