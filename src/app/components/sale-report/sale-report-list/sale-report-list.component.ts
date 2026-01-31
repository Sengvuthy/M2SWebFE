import { Component, OnInit } from '@angular/core';
import { SaleReportService, SaleReportDTO } from '../../../services/sale-report.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SalesService } from '../../../services/sales.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sale-report-list',
  standalone: true,
  templateUrl: './sale-report-list.component.html',
  styleUrls: ['./sale-report-list.component.css'],
  imports: [CommonModule, FormsModule]
})
export class SaleReportListComponent implements OnInit {
  reports: SaleReportDTO[] = [];
  sales: any[] = [];
  dailyDate: string = '';
  isLoading = false;

  constructor(
    private reportService: SaleReportService,
    private salesService: SalesService,
    private toastr: ToastrService,
    private router: Router
  ) { }

  ngOnInit() {
    const today = new Date();
    this.dailyDate = today.toISOString().split('T')[0]; // format: YYYY-MM-DD
    this.searchDaily(); // ✅ auto-trigger
  }

  /** 🔹 Search sales for a specific date */
  searchDaily() {
    if (!this.dailyDate) return;
    this.isLoading = true;

    // ✅ Only load sales data — no export
    this.salesService.getSalesByDate(this.dailyDate).subscribe({
      next: res => {
        this.sales = this.groupSalesByInvoice(res);
        this.isLoading = false;
        this.sendDailySummary();
      },
      error: () => {
        this.toastr.error('Failed to load daily report');
        this.isLoading = false;
      }
    });
  }

  sendDailySummary() {
    const report: SaleReportDTO = {
      reportDate: this.dailyDate,
      totalSalesAmount: this.dailyIncome,
      totalTransactions: this.sales.length,
      totalUnitsSold: this.sales.reduce((sum, s) => sum + Number(s.totalUnits || 0), 0)
    };

    this.reportService.saveDailyReport(report).subscribe({
      next: () => {
        // this.toastr.success('✅ Daily summary saved');
        // 🔹 Chain: refresh daily + monthly components
        this.refreshDaily();
        this.refreshMonthly();
      },
      error: () => this.toastr.error('❌ Failed to save daily summary')
    });
  }

  private refreshDaily() {
    this.reportService.getDailyReport(this.dailyDate).subscribe({
      next: res => this.reports = [res]
    });
  }

  private refreshMonthly() {
    const today = new Date();
    this.reportService.generateMonthlyReport(today.getFullYear(), today.getMonth() + 1).subscribe({
      // next: res => this.toastr.success(`📊 Monthly report updated for ${res.reportMonth}/${res.reportYear}`)
    });
  }

  /** 🔹 Clear results */
  clearResults() {
    this.reports = [];
    this.sales = [];
    this.dailyDate = '';
  }

  /** 🔹 Calculate daily income */
  get dailyIncome(): number {
    return this.sales.reduce((sum, s) => sum + Number(s.totalAmount), 0);
  }

  /** 🔹 Group sales by invoice */
  private groupSalesByInvoice(sales: any[]): any[] {
    const grouped: { [invoice: string]: any } = {};
    for (const s of sales) {
      if (!grouped[s.invoice]) {
        grouped[s.invoice] = {
          invoice: s.invoice,
          saleDate: s.saleDate,
          saleTime: s.saleTime,
          totalAmount: 0,
          totalUnits: 0
        };
      }
      grouped[s.invoice].totalAmount += Number(s.soldAmount);
      grouped[s.invoice].totalUnits += Number(s.numberOfUnit || 0);
    }
    return Object.values(grouped).sort((a, b) => {
      const numA = parseInt(a.invoice.replace('INV-', ''));
      const numB = parseInt(b.invoice.replace('INV-', ''));
      return numB - numA;
    });
  }

  // ✅ Navigation methods
  goToDaily() {
    this.router.navigate(['/sale-report/daily']);
  }

  goToMonthly() {
    this.router.navigate(['/sale-report/monthly']);
  }

  goToYearly() {
    this.router.navigate(['/sale-report/yearly']);
  }
}
