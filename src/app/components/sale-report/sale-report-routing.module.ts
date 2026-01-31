import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SaleReportComponent } from './sale-report.component';
import { SaleReportListComponent } from './sale-report-list/sale-report-list.component';
import { SaleReportDailyComponent } from './sale-report-daily/sale-report-daily.component';
import { SaleReportMonthlyComponent } from './sale-report-monthly/sale-report-monthly.component';
import { SaleReportYearlyComponent } from './sale-report-yearly/sale-report-yearly.component';

const routes: Routes = [
  {
    path: '', component: SaleReportComponent,
    children: [
      { path: '', component: SaleReportListComponent },          // /sale-report
      { path: 'daily', component: SaleReportDailyComponent },     // /sale-report/daily
      { path: 'monthly', component: SaleReportMonthlyComponent }, // /sale-report/monthly
      { path: 'yearly', component: SaleReportYearlyComponent }    // /sale-report/yearly
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SaleReportRoutingModule {}
