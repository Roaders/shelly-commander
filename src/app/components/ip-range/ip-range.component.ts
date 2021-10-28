import { Component } from '@angular/core';
import { IpRange } from '../../contracts';
import { convertToIpGroup, isStringValueValid, IpHelper, isIpRange } from '../../helpers';
import { ShellyDiscoveryService } from '../../services';

const allowedInput = /[*0-9-]/;
const ipRangeStorageKey = 'SAVED_IP_RANGE';

@Component({
    selector: 'ip-range',
    templateUrl: './ip-range.component.html',
    styleUrls: ['./ip-range.component.scss'],
})
export class IpRangeComponent {
    public groupOne = '192';
    public groupTwo = '168';
    public groupThree = '0';
    public groupFour = '*';

    constructor(private ipHelper: IpHelper, private discoveryService: ShellyDiscoveryService) {
        this.loadRange();
    }

    public get isFormValid(): boolean {
        return this.getValues().every(isStringValueValid);
    }

    public get buttonText(): string {
        const range = this.getIpRange();
        if (range != null) {
            const addresses = this.ipHelper.getIpAddresses(range);
            return `Scan ${addresses.length} IP Addresses`;
        }
        return 'Scan';
    }

    public scanIp(): void {
        const range = this.getIpRange();

        if (range == null) {
            console.error(`Cannot perform scan as range is not valid`);
            return;
        }

        this.saveRange();
        this.discoveryService.scan(range);
    }

    public inputClass(value: string): string {
        return value.indexOf('-') >= 0 ? 'range-input-wide' : 'range-input-narrow';
    }

    public validateInput(event: KeyboardEvent): void {
        const target = event.target as HTMLInputElement;
        const value = target.value;

        if (!allowedInput.test(event.key)) {
            return event.preventDefault();
        }

        switch (event.key) {
            case '*':
                if (value == '' || (target.selectionStart === 0 && target.selectionEnd === value.length)) {
                    return;
                } else {
                    return event.preventDefault();
                }
            case '-':
                if (value.indexOf(event.key) >= 0) {
                    return event.preventDefault();
                }
        }

        const maxLength = value.indexOf('-') >= 0 || event.key === '-' ? 7 : 3;

        if (value.length >= maxLength && target.selectionStart === target.selectionEnd) {
            return event.preventDefault();
        }
    }

    private getIpRange(): IpRange | undefined {
        const ipGroups = this.getValues().map(convertToIpGroup);

        return isIpRange(ipGroups) ? ipGroups : undefined;
    }

    private getValues(): [string, string, string, string] {
        return [this.groupOne, this.groupTwo, this.groupThree, this.groupFour];
    }

    private saveRange() {
        window.localStorage.setItem(ipRangeStorageKey, JSON.stringify(this.getValues()));
    }

    private loadRange() {
        const rangeString = window.localStorage.getItem(ipRangeStorageKey);

        if (rangeString == null) {
            return;
        }

        const [groupOne, groupTwo, groupThree, groupFour] = JSON.parse(rangeString);

        this.groupOne = groupOne;
        this.groupTwo = groupTwo;
        this.groupThree = groupThree;
        this.groupFour = groupFour;
    }
}
