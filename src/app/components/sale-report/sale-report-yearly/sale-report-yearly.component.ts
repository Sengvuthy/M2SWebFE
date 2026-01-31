import { Component } from '@angular/core';
import { SaleReportService, YearlySaleReportDTO, MonthlySaleReportDTO } from '../../../services/sale-report.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-sale-report-yearly',
  standalone: false,
  templateUrl: './sale-report-yearly.component.html',
  styleUrls: ['./sale-report-yearly.component.css']
})
export class SaleReportYearlyComponent {
  isLoading = false;
  yearlyYear: number | null = null;
  yearlySummary: YearlySaleReportDTO | null = null;

  constructor(
    private reportService: SaleReportService,
    private toastr: ToastrService
  ) { }

  searchYearly() {
    if (!this.yearlyYear) return;
    this.isLoading = true;
    this.reportService.generateYearlyReport(this.yearlyYear).subscribe({
      next: res => {
        this.yearlySummary = res;
        // this.toastr.success(`📊 Yearly report loaded for ${res.reportYear}`);
        this.isLoading = false;
      },
      error: () => {
        this.toastr.error('❌ Failed to load yearly report');
        this.isLoading = false;
      }
    });
  }

  clearResults() {
    this.yearlySummary = null;
    this.yearlyYear = null;
  }

  get totalIncome(): number {
    return this.yearlySummary?.monthlySummaries
      ?.reduce((sum, m) => sum + Number(m.totalSalesAmount), 0) ?? 0;
  }

  getMonthLabel(month: number): string {
    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return labels[month - 1] || `Month ${month}`;
  }

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
