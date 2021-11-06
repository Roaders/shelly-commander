import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './components/app/app.component';
import { IpRangeComponent } from './components/ip-range/ip-range.component';
import { ResultsGridComponent } from './components/results-grid/results-grid.component';
import { AgGridModule } from 'ag-grid-angular';
import { AddressCellRenderer } from './components/cell-renderers/address/address.cell-renderer';
import { EnableCorsCellRenderer } from './components/cell-renderers/enable-cors/enable-cors.cell-renderer';
import { ActionsGridComponent } from './components/actions-grid/actions-grid.component';

@NgModule({
    declarations: [
        AppComponent,
        IpRangeComponent,
        ResultsGridComponent,
        AddressCellRenderer,
        EnableCorsCellRenderer,
        ActionsGridComponent,
    ],
    imports: [BrowserModule, FormsModule, AgGridModule.withComponents([AddressCellRenderer, EnableCorsCellRenderer])],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
