import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { SaleReportRoutingModule } from './sale-report-routing.module';
import { SaleReportComponent } from './sale-report.component';
import { SaleReportListComponent } from './sale-report-list/sale-report-list.component';
import { SaleReportDailyComponent } from './sale-report-daily/sale-report-daily.component';
import { SaleReportMonthlyComponent } from './sale-report-monthly/sale-report-monthly.component';
import { SaleReportYearlyComponent } from './sale-report-yearly/sale-report-yearly.component';

@NgModule({
  declarations: [
    SaleReportComponent,
    SaleReportDailyComponent,
    SaleReportMonthlyComponent,
    SaleReportYearlyComponent    
  ],
  imports: [
    CommonModule,
    FormsModule,
    SaleReportRoutingModule,
    SaleReportListComponent
  ]
})
export class SaleReportModule {}
