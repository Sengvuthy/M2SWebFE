//sales-list.component.ts
import { Component, OnInit } from '@angular/core';
import { SalesService } from '../../../services/sales.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { HttpParams } from '@angular/common/http';

@Component({
  selector: 'app-sales-list',
  standalone: false,
  templateUrl: './sales-list.component.html',
  styleUrls: ['./sales-list.component.css']
})
export class SalesListComponent implements OnInit {

  sales: any[] = [];
  isLoading = true;

  page = 1;
  limit = 30;
  totalPages = 1;

  searchInvoice = '';
  sortBy = 'invoice';
  sortDir: 'asc' | 'desc' = 'desc';

  constructor(
    private salesService: SalesService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadInvoices();
  }

  loadInvoices() {
    this.isLoading = true;

    let params = new HttpParams()
      .set('_page', this.page.toString())
      .set('_limit', this.limit.toString())
      .set('_sortBy', this.sortBy)
      .set('_sortDir', this.sortDir);

    if (this.searchInvoice.trim() !== '') {
      params = params.set('invoice', this.searchInvoice.trim());
    }

    this.salesService.getInvoiceList(params).subscribe({
      next: (res) => {
        this.sales = res.list; // InvoiceSummaryDTO objects
        this.totalPages = res.paginationDTO.totalPages;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.toastr.error('Failed to load invoices', 'Error');
        console.error('Error fetching invoices:', err);
      }
    });
  }

  groupSalesByInvoice(sales: any[]): any[] {
    const grouped: { [invoice: string]: any } = {};

    for (const s of sales) {
      if (!grouped[s.invoice]) {
        grouped[s.invoice] = {
          invoice: s.invoice,
          customerName: s.customerName,
          saleDate: s.saleDate,
          saleTime: s.saleTime,
          totalAmount: 0,
          totalUnits: 0
        };
      }
      grouped[s.invoice].totalAmount += Number(s.soldAmount);
      grouped[s.invoice].totalUnits += Number(s.numberOfUnit);
    }

    return Object.values(grouped).sort((a, b) => {
      const numA = parseInt(a.invoice.replace('INV-', ''));
      const numB = parseInt(b.invoice.replace('INV-', ''));
      return numB - numA;
    });
  }

  sort(column: string) {
    if (this.sortBy === column) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.sortDir = 'asc';
    }
    this.page = 1;
    this.loadInvoices();
  }

  nextPage() {
    if (this.page < this.totalPages) {
      this.page++;
      this.loadInvoices();
    }
  }

  prevPage() {
    if (this.page > 1) {
      this.page--;
      this.loadInvoices();
    }
  }

  goToPage(p: number) {
    this.page = p;
    this.loadInvoices();
  }

  get pageNumbers(): number[] {
    const delta = 2;
    const pages: number[] = [];
    pages.push(1);

    if (this.page - delta > 2) pages.push(-1);

    for (let i = Math.max(2, this.page - delta);
      i <= Math.min(this.totalPages - 1, this.page + delta);
      i++) {
      pages.push(i);
    }

    if (this.page + delta < this.totalPages - 1) pages.push(-1);
    if (this.totalPages > 1) pages.push(this.totalPages);

    return pages;
  }

  search() {
    this.page = 1;
    this.loadInvoices();
  }

  clearSearch() {
    this.searchInvoice = '';
    this.page = 1;
    this.loadInvoices();
  }

  openDetail(invoice: string) {
    this.router.navigate(['/sales/detail', invoice]);
  }

  goToCreateSale() {
    this.router.navigate(['/sales/form']);
  }

  editSale(invoice: string) {
    this.router.navigate(['/sales/form', invoice]);
  }

  cancelSale(invoice: string) {
    this.salesService.cancelSale(invoice).subscribe({
      next: () => {
        this.toastr.success('Sale cancelled successfully', 'Cancel Success');
        this.clearSearch();
      },
      error: (err) => {
        const msg = err.error?.message || 'Cancel failed';
        this.toastr.error(msg, 'Cancel Error');
      }
    });
  }

  importSales() {
    this.salesService.importSales().subscribe({
      next: () => {
        this.toastr.success('Sales imported successfully!', 'Import Success');
        this.loadInvoices();
      },
      error: (err) => {
        const msg = err.error || 'Import failed';
        this.toastr.error(msg, 'Import Error');
      }
    });
  }
}
