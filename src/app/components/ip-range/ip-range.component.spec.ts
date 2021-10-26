import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IpRangeComponent } from './ip-range.component';

describe('IpRangeComponent', () => {
    let component: IpRangeComponent;
    let fixture: ComponentFixture<IpRangeComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [IpRangeComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(IpRangeComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
