import { IpHelper } from '.';
import {} from './ip.helper';

describe(`(ip.helper)`, () => {
    function createInstance() {
        return new IpHelper();
    }

    it('should create', () => {
        expect(createInstance()).toBeDefined();
    });
});
