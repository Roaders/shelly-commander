import { Component } from '@angular/core';

const allowedInput = /[*0-9-]/;

@Component({
    selector: 'ip-range',
    templateUrl: './ip-range.component.html',
    styleUrls: ['./ip-range.component.scss'],
})
export class IpRangeComponent {
    public groupOne = '1';
    public groupTwo = '2';
    public groupThree = '3';
    public groupFour = '4';

    public get isFormValid(): boolean {
        return true;
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

        if (value.length >= maxLength) {
            return event.preventDefault();
        }
    }
}
