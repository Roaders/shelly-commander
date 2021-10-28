import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './components/app/app.component';
import { IpRangeComponent } from './components/ip-range/ip-range.component';
import { ResultsGridComponent } from './components/results-grid/results-grid.component';

@NgModule({
    declarations: [AppComponent, IpRangeComponent, ResultsGridComponent],
    imports: [BrowserModule, FormsModule],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
