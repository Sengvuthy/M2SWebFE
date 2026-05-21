//product-import-list.component.ts
import { Component, OnInit } from '@angular/core';
import { ProductImportService } from '../../../services/product-import.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { HttpParams } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-product-import-list',
  standalone: false,
  templateUrl: './product-import-list.component.html',
  styleUrls: ['./product-import-list.component.css']
})
export class ProductImportListComponent implements OnInit {

  imports: any[] = [];
  isLoading = true;

  page = 1;
  limit = 30;
  totalPages = 1;

  searchImportId = '';
  sortBy = 'importId';
  sortDir: 'asc' | 'desc' = 'desc';

  constructor(
    private importService: ProductImportService,
    private router: Router,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.loadImports();
  }

  loadImports() {
    this.isLoading = true;

    let params = new HttpParams()
      .set('_page', this.page.toString())
      .set('_limit', this.limit.toString())
      .set('_sortBy', this.sortBy)
      .set('_sortDir', this.sortDir);

    if (this.searchImportId.trim() !== '') {
      params = params.set('importId', this.searchImportId.trim());
    }

    this.importService.getImportIdList(params).subscribe({
      next: (res) => {
        this.imports = res.list;
        this.totalPages = res.paginationDTO.totalPages;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.toastr.error('Failed to load imports', 'Error');
        console.error('Error fetching imports:', err);
      }
    });
  }

  groupProductImportsByImportId(productImports: any[]): any[] {
    const grouped: { [importId: string]: any } = {};

    for (const s of productImports) {
      if (!grouped[s.importId]) {
        grouped[s.importId] = {
          importId: s.importId,
          supplierName: s.supplierName,
          importerName: s.importerName,
          importDate: s.importDate,
          importTime: s.importTime,
          totalAmount: 0,
          totalUnits: 0
        };
      }
      grouped[s.importId].totalAmount += Number(s.buyAmount);
      grouped[s.importId].totalUnits += Number(s.importUnit);
    }

    return Object.values(grouped).sort((a, b) => {
      const numA = parseInt(a.importId.replace('IMP-', ''));
      const numB = parseInt(b.importId.replace('IMP-', ''));
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
    this.loadImports();
  }

  nextPage() {
    if (this.page < this.totalPages) {
      this.page++;
      this.loadImports();
    }
  }

  prevPage() {
    if (this.page > 1) {
      this.page--;
      this.loadImports();
    }
  }

  goToPage(p: number) {
    this.page = p;
    this.loadImports();
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
    this.loadImports();
  }

  clearSearch() {
    this.searchImportId = '';
    this.page = 1;
    this.loadImports();
  }

  openDetail(importId: string) {
    this.router.navigate(['/product-import/product-import/detail', importId]);
  }

  goToCreateImport() {
    this.router.navigate(['/product-import/form']);
  }

  editImport(importId: string) {
    this.router.navigate(['/product-import/form', importId]);
  }

  cancelProductImport(importId: string) {
    this.importService.cancelProductImport(importId).subscribe({
      next: () => {
        this.toastr.success('Import cancelled successfully', 'Cancel Success');
        this.loadImports();   // reload list after cancel
      },
      error: (err) => {
        const msg = err.error?.message || 'Cancel failed';
        this.toastr.error(msg, 'Cancel Error');
      }
    });
  }

  importProductImports() {
    this.importService.importProductImports().subscribe({
      next: () => {
        this.toastr.success('Product imports imported successfully!', 'Import Success');
        this.loadImports(); // reload the list after import
      },
      error: (err: HttpErrorResponse) => {
        const msg = err.error?.message || 'Import failed';
        this.toastr.error(msg, 'Import Error');
      }
    });
  }
}
