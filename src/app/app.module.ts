import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './components/app/app.component';
import { IpRangeComponent } from './components/ip-range/ip-range.component';

@NgModule({
    declarations: [AppComponent, IpRangeComponent],
    imports: [BrowserModule],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
