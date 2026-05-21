//sale-report-yearly.component.ts
import { Component, OnInit } from '@angular/core';
import { SaleReportService, YearlySaleReportDTO } from '../../../services/sale-report.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-sale-report-yearly',
  standalone: false,
  templateUrl: './sale-report-yearly.component.html',
  styleUrls: ['./sale-report-yearly.component.css']
})
export class SaleReportYearlyComponent implements OnInit {
  isLoading = false;
  yearlyYear: number | null = null;
  yearlySummary: YearlySaleReportDTO | null = null;

  constructor(
    private reportService: SaleReportService,
    private toastr: ToastrService
  ) { }

  ngOnInit() {
    // ✅ Auto-trigger for current year
    const today = new Date();
    this.yearlyYear = today.getFullYear();
    this.searchYearly();
  }

  /** 🔹 Load yearly summary */
  searchYearly() {
    if (!this.yearlyYear) return;
    this.isLoading = true;

    this.reportService.generateYearlyReport(this.yearlyYear).subscribe({
      next: res => {
        // 🔹 Sort months descending (Dec → Jan)
        res.monthlySummaries = res.monthlySummaries.sort((a, b) => b.reportMonth - a.reportMonth);

        this.yearlySummary = res;
        this.isLoading = false;
        // this.toastr.success(`📊 Yearly report loaded for ${res.reportYear}`);
      },
      error: () => {
        this.toastr.error('❌ Failed to load yearly report');
        this.isLoading = false;
      }
    });
  }

  /** 🔹 Clear results */
  clearResults() {
    this.yearlySummary = null;
    this.yearlyYear = null;
  }

  /** 🔹 Totals across all months */
  get totalIncome(): number {
    return this.yearlySummary?.monthlySummaries
      ?.reduce((sum, m) => sum + Number(m.totalSalesAmount), 0) ?? 0;
  }

  get totalTransactions(): number {
    return this.yearlySummary?.monthlySummaries
      ?.reduce((sum, m) => sum + Number(m.totalTransactions), 0) ?? 0;
  }

  get totalUnits(): number {
    return this.yearlySummary?.monthlySummaries
      ?.reduce((sum, m) => sum + Number(m.totalUnitsSold), 0) ?? 0;
  }

  /** 🔹 Month label helper */
  getMonthLabel(month: number): string {
    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return labels[month - 1] || `Month ${month}`;
  }

  /** 🔹 Import yearly report */
  importYearly() {
    this.isLoading = true;
    this.reportService.importYearlyReport().subscribe({
      next: summary => {
        // this.toastr.success(`📥 Imported yearly report: ${summary.created} created, ${summary.updated} updated`);
        if (summary.errors?.length) {
          this.toastr.error(`❌ ${summary.errors.length} errors`);
          console.error('Import errors:', summary.errors);
        }
        this.isLoading = false;
      },
      error: () => {
        this.toastr.error('❌ Import failed');
        this.isLoading = false;
      }
    });
  }
}
