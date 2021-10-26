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
