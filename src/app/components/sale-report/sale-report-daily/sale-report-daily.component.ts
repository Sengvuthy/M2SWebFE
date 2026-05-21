//sale-report-daily.component.ts
import { Component, OnInit } from '@angular/core';
import { SaleReportService, SaleReportDTO } from '../../../services/sale-report.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-sale-report-daily',
  standalone: false,
  templateUrl: './sale-report-daily.component.html',
  styleUrls: ['./sale-report-daily.component.css']
})
export class SaleReportDailyComponent implements OnInit {
  dailyDate: string = '';
  dailySummary: SaleReportDTO | null = null; // ✅ use strong typing
  isLoading = false;

  constructor(
    private reportService: SaleReportService,
    private toastr: ToastrService
  ) { }

  ngOnInit() {
    const today = new Date();
    this.dailyDate = today.toISOString().split('T')[0]; // YYYY-MM-DD
    this.loadDailySummary(); // ✅ auto-trigger
  }

  loadDailySummary() {
    if (!this.dailyDate) return;
    this.isLoading = true;

    this.reportService.getDailyReport(this.dailyDate).subscribe({
      next: res => {
        this.dailySummary = res;
        // this.toastr.success(`✅ Daily summary loaded for ${this.dailyDate}`);
        this.isLoading = false;
      },
      error: err => {
        console.error(err);
        this.toastr.error('❌ Failed to load daily summary');
        this.isLoading = false;
      }
    });
  }

  triggerImport() {
    this.isLoading = true;
    this.reportService.importDailyReport().subscribe({
      next: summary => {
        const message = `✅ Imported daily report: ${summary.created} created, ${summary.updated} updated`;
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
    this.dailySummary = null;
    this.dailyDate = '';
  }

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

    // 🔹 Sort by date + time (latest first)
    return Object.values(grouped).sort((a, b) => {
      const dateA = new Date(a.saleDate + 'T' + a.saleTime);
      const dateB = new Date(b.saleDate + 'T' + b.saleTime);
      return dateB.getTime() - dateA.getTime(); // descending
    });
  }
}
