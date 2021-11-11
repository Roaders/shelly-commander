import { StringTemplateVariables } from './contracts';

export const ipRangeStorageKey = 'SAVED_IP_RANGE';
export const discoveredDevicesStorageKey = 'DISCOVERED_DEVICES';

const templateRecord: StringTemplateVariables = {
    action: '',
    deviceName: '',
    deviceHostName: '',
    index: '',
    deviceMac: '',
    deviceType: '',
};

export const TemplateKeys = Object.keys(templateRecord) as (keyof StringTemplateVariables)[];
