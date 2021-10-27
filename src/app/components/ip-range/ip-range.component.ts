import { Component } from '@angular/core';
import { convertToIpGroup, isStringValueValid, IpHelper, isIpRange } from '../../helpers';

const allowedInput = /[*0-9-]/;

@Component({
    selector: 'ip-range',
    templateUrl: './ip-range.component.html',
    styleUrls: ['./ip-range.component.scss'],
})
export class IpRangeComponent {
    public groupOne = '';
    public groupTwo = '';
    public groupThree = '';
    public groupFour = '';

    constructor(private ipHelper: IpHelper) {}

    public get isFormValid(): boolean {
        return this.getValues().every(isStringValueValid);
    }

    public get buttonText(): string {
        const ipGroups = this.getValues().map(convertToIpGroup);
        if (isIpRange(ipGroups)) {
            const addresses = this.ipHelper.getIpAddresses(ipGroups);
            return `Scan ${addresses.length} IP Addresses`;
        }
        return 'Scan';
    }

    public scanIp(): void {
        console.log(`Scan`, this);
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

    private getValues(): [string, string, string, string] {
        return [this.groupOne, this.groupTwo, this.groupThree, this.groupFour];
    }
}
