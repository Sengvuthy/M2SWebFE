//sale-report-monthly.component.ts
import { Component, OnInit } from '@angular/core';
import { SaleReportService, MonthlySaleReportDTO } from '../../../services/sale-report.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-sale-report-monthly',
  standalone: false,
  templateUrl: './sale-report-monthly.component.html',
  styleUrls: ['./sale-report-monthly.component.css']
})
export class SaleReportMonthlyComponent implements OnInit {
  isLoading = false;
  monthlyMonth: number | null = null;
  monthlyYear: number | null = null;
  monthlySummary: MonthlySaleReportDTO | null = null;

  constructor(
    private reportService: SaleReportService,
    private toastr: ToastrService
  ) { }

  ngOnInit() {
    const today = new Date();
    this.monthlyMonth = today.getMonth() + 1; // JS months are 0-based
    this.monthlyYear = today.getFullYear();
    this.loadMonthlySummary(); // ✅ auto-trigger
  }

  /** 🔹 Load monthly summary */
  loadMonthlySummary() {
    if (!this.monthlyMonth || !this.monthlyYear) return;
    this.isLoading = true;

    this.reportService.generateMonthlyReport(this.monthlyYear, this.monthlyMonth).subscribe({
      next: res => {
        res.dailySummaries = res.dailySummaries.sort((a, b) =>
          new Date(b.reportDate).getTime() - new Date(a.reportDate).getTime()
        );
        this.monthlySummary = res;
        this.isLoading = false;
        this.triggerYearlySummary(res.reportYear);
        this.triggerMonthlyExport();
      },
      error: () => {
        this.toastr.error('❌ Failed to load monthly summary');
        this.isLoading = false;
      }
    });
  }

  /** 🔹 Trigger yearly summary after monthly */
  private triggerYearlySummary(year: number) {
    this.reportService.generateYearlyReport(year).subscribe({
      // next: () => this.toastr.success(`📊 Yearly report updated for ${year}`),
      error: () => this.toastr.error(`❌ Failed to update yearly report for ${year}`)
    });
  }

  /** 🔹 Trigger monthly Excel export */
  private triggerMonthlyExport() {
    this.reportService.exportMonthlyReport().subscribe({
      // next: res => this.toastr.success(res),
      error: () => this.toastr.error('❌ Monthly export failed')
    });
  }

  /** 🔹 Import monthly report */
  triggerImport() {
    this.isLoading = true;
    this.reportService.importMonthlyReport().subscribe({
      next: summary => {
        const message = `✅ Imported monthly report: ${summary.created} created, ${summary.updated} updated`;
        // this.toastr.success(message);
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

  clearSummary() {
    this.monthlySummary = null;
    this.monthlyMonth = null;
    this.monthlyYear = null;
  }
}
