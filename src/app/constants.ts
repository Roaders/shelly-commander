import { StringTemplateVariables } from './contracts';

export const ipRangeStorageKey = 'SAVED_IP_RANGE';
export const discoveredDevicesStorageKey = 'DISCOVERED_DEVICES';
export const urlTemplateStorageKey = 'URL_TEMPLATE';

export const defaultUrlTemplate = 'http://192.168.0.1/api?device={deviceName}&action={action}&index={index}';

const templateRecord: StringTemplateVariables = {
    action: '',
    deviceName: '',
    deviceHostName: '',
    index: '',
    deviceMac: '',
    deviceType: '',
};

export const TemplateKeys = Object.keys(templateRecord) as (keyof StringTemplateVariables)[];
