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

export type ShellyResponse = {
    type: string;
    mac: string;
    auth: false;
    fw: string;
    num_outputs: number;
};

export type ShellyDiscoveryResult = {
    address: string;
    response?: ShellyResponse;
    error?: any;
};
