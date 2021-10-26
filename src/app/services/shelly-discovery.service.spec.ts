import { ShellyDiscoveryService } from './shelly-discovery.service';
import { Mock, IMocked } from '@morgan-stanley/ts-mocking-bird';
import { IpHelper } from '../helpers';

describe(`${ShellyDiscoveryService.name} (shelly-discovery.service)`, () => {
    let mockHelper: IMocked<IpHelper>;

    beforeEach(() => {
        mockHelper = Mock.create<IpHelper>();
    });

    function createInstance() {
        return new ShellyDiscoveryService(mockHelper.mock);
    }

    it('should create', () => {
        expect(createInstance()).toBeDefined();
    });
});
