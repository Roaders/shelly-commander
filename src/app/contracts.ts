import { ICellRendererParams } from 'ag-grid-community';

export type NumericRange =
    | {
          min: number;
          max: number;
      }
    | {
          min?: number;
          max: number;
      }
    | {
          min: number;
          max?: number;
      };

export type IpGroup = number | '*' | NumericRange;

export type IpRange = [IpGroup, IpGroup, IpGroup, IpGroup];

export type ActionRow = { rowType: 'actionRow'; id: string; name: string; enabled: boolean; action: ShellyAction };
export type ActionURLRow = {
    rowType: 'actionURLRow';
    id: string;
    actionName: string;
    action: ShellyAction;
    updateValue: boolean;
    existingUrl?: string;
    updatedUrl: string;
    index: number;
};

export type StartStream = {
    type: 'startStream';
    addresses: string[];
};

export type StreamComplete = {
    type: 'streamComplete';
};

export type ShellyAction = {
    index: number;
    enabled: boolean;
    urls: string[];
};

export type ShellyActionRecord = Record<string, ShellyAction[]>;

export type ShellyActionsResult = {
    actions: ShellyActionRecord;
};

export type ShellyDiscoveryResult = {
    type: 'result';
    address: string;
    info: ShellyInfo;
    settings: ShellySettings;
};

export type ShellyDiscoveryError = {
    type: 'error';
    address: string;
    error: unknown;
    timeout: boolean;
};

export type DiscoveryMessages = StartStream | StreamComplete | ShellyDiscoveryResult | ShellyDiscoveryError;

export type ShellyInfo = {
    type: string;
    mac: string;
    auth: false;
    fw: string;
    num_outputs: number;
};

export type ShellyWifi = {
    enabled: boolean;
    ssid: string;
    ipv4_method: string;
    ip: string;
    gw: string;
    mask: string;
    dns: string;
};

export type ShellySettings = {
    device: {
        type: string;
        mac: string;
        hostname: string;
    };
    wifi_ap: {
        enabled: boolean;
        ssid: string;
        key: string;
    };
    wifi_sta: ShellyWifi;
    wifi_sta1: ShellyWifi;
    ap_roaming: {
        enabled: boolean;
        threshold: number;
    };
    mqtt: {
        enable: false;
        server: string;
        user: string;
        id: string;
        reconnect_timeout_max: number;
        reconnect_timeout_min: number;
        clean_session: boolean;
        keep_alive: number;
        max_qos: number;
        retain: boolean;
        update_period: number;
    };
    coiot: {
        enabled: boolean;
        update_period: number;
        peer: string;
    };
    sntp: {
        server: string;
        enabled: boolean;
    };
    login: {
        enabled: boolean;
        unprotected: boolean;
        username: string;
    };
    pin_code: string;
    name: string;
    fw: string;
    discoverable: boolean;
    build_info: {
        build_id: string;
        build_timestamp: string;
        build_version: string;
    };
    cloud: {
        enabled: boolean;
        connected: boolean;
    };
    timezone: string;
    lat: number;
    lng: number;
    tzautodetect: boolean;
    tz_utc_offset: number;
    tz_dst: boolean;
    tz_dst_auto: boolean;
    time: string;
    unixtime: number;
    debug_enable: boolean;
    allow_cross_origin: boolean;
    wifirecovery_reboot_enabled: boolean;
};

export interface IActionsGrid {
    onEnabledClick: (row: ActionRow | ActionURLRow) => void;
}

export interface IActionsGridCellRendererParams extends ICellRendererParams {
    owner?: IActionsGrid;
}
