import { Mock, setupFunction, setupProperty } from '@morgan-stanley/ts-mocking-bird';
import { IpHelper } from '../../helpers';
import { IpRangeComponent } from './ip-range.component';

describe(` (ip-range.component)`, () => {
    function createInstance() {
        return new IpRangeComponent(Mock.create<IpHelper>().mock);
    }

    it(`should create`, () => {
        expect(createInstance()).toBeDefined();
    });

    describe('validateInput', () => {
        const tests: {
            value?: string;
            key: string;
            preventDefault: boolean;
            selectionStart?: number;
            selectionEnd?: number;
        }[] = [
            { key: '5', preventDefault: false },
            { key: '*', preventDefault: false },
            { key: '-', preventDefault: false },
            { key: 'a', preventDefault: true },
            { key: '3', value: '12', preventDefault: false },
            { key: '1', value: '123', preventDefault: true },
            { key: '1', value: '123', preventDefault: false, selectionStart: 1, selectionEnd: 2 },
            { key: '6', value: '123-45', preventDefault: false },
            { key: '1', value: '123-456', preventDefault: true },
            { key: '1', value: '123-456', preventDefault: false, selectionStart: 1, selectionEnd: 2 },
            { key: '-', value: '123', preventDefault: false },
            { key: '-', value: '123-', preventDefault: true },
            { key: '*', value: '1', preventDefault: true },
            { key: '*', value: '1', selectionStart: 0, selectionEnd: 1, preventDefault: false },
            { key: '*', value: '123-456', selectionStart: 0, selectionEnd: 7, preventDefault: false },
        ];

        tests.forEach(({ value, key, preventDefault, selectionStart, selectionEnd }) => {
            value = value ?? '';
            selectionStart = selectionStart ?? 0;
            selectionEnd = selectionEnd ?? 0;

            const preventDefaultMessage = preventDefault ? 'prevent default' : 'not prevent default';

            it(`should ${preventDefaultMessage} given value: '${value}' and key: '${key}' and selection ${selectionStart}-${selectionEnd}`, () => {
                const instance = createInstance();
                const target = Mock.create<HTMLInputElement>().setup(
                    setupProperty('value', value),
                    setupProperty('selectionStart', selectionStart),
                    setupProperty('selectionEnd', selectionEnd),
                ).mock;
                const mockEvent = Mock.create<KeyboardEvent>().setup(
                    setupProperty('target', target),
                    setupProperty('key', key),
                    setupFunction('preventDefault'),
                );

                instance.validateInput(mockEvent.mock);

                if (preventDefault) {
                    expect(mockEvent.withFunction('preventDefault')).wasCalledOnce();
                } else {
                    expect(mockEvent.withFunction('preventDefault')).wasNotCalled();
                }
            });
        });
    });
});
