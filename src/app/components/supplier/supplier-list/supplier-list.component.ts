//supplier-list.component.ts
import { Component, OnInit } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { SupplierService } from '../../../services/supplier.service';

@Component({
  selector: 'app-supplier-list',
  standalone: false,
  templateUrl: './supplier-list.component.html',
  styleUrls: ['./supplier-list.component.css']
})
export class SupplierListComponent implements OnInit {

  suppliers: any[] = [];
  isLoading = true;

  page = 1;
  limit = 30;
  totalPages = 1;

  searchName = '';

  sortBy = 'id';
  sortDir: 'asc' | 'desc' = 'asc';

  constructor(
    private supplierService: SupplierService,
    private router: Router,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.loadSuppliers();
  }

  loadSuppliers() {
    this.isLoading = true;

    let params = new HttpParams()
      .set("page", this.page.toString())
      .set("size", this.limit.toString())
      .set("sort", `${this.sortBy},${this.sortDir}`);

    if (this.searchName.trim() !== '') {
      params = params.set("name", this.searchName.trim());
    }

    this.supplierService.getSupplierList(params).subscribe({
      next: (res) => {
        const suppliers = res.list;
        const totalPages = res.paginationDTO.totalPages;

        if (suppliers.length === 0 && this.page > 1) {
          this.page = 1;
          this.loadSuppliers();
          return;
        }

        this.suppliers = suppliers;
        this.totalPages = totalPages;
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        console.error("Error fetching suppliers:", error);
      }
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
    this.loadSuppliers();
  }

  nextPage() {
    if (this.page < this.totalPages) {
      this.page++;
      this.loadSuppliers();
    }
  }

  prevPage() {
    if (this.page > 1) {
      this.page--;
      this.loadSuppliers();
    }
  }

  goToPage(p: number) {
    this.page = p;
    this.loadSuppliers();
  }

  search() {
    this.page = 1;
    this.loadSuppliers();
  }

  clearSearch() {
    this.searchName = '';
    this.page = 1;
    this.loadSuppliers();
  }

  goToCreateSupplier() {
    this.router.navigate(['/supplier/form']);
  }

  editSupplier(id: number) {
    this.router.navigate(['/supplier/form', id]);
  }

  deleteSupplier(id: number) {
    this.supplierService.deleteSupplier(id).subscribe({
      next: res => {
        this.toastr.success(res, "Delete Success");
        this.clearSearch();
      },
      error: err => {
        const msg = err.error?.message || "Delete failed";
        this.toastr.error(msg, "Delete Error");
      }
    });
  }

  importSuppliers() {
    this.supplierService.importSuppliers().subscribe({
      next: () => {
        this.toastr.success("Suppliers imported successfully!", "Import Success");
        this.loadSuppliers();
      },
      error: (err) => {
        const msg = err.error || "Import failed";
        this.toastr.error(msg, "Import Error");
      }
    });
  }

  exportSuppliers() {
    this.supplierService.exportSuppliers().subscribe({
      next: () => {
        this.toastr.success("Suppliers exported successfully!", "Export Success");
      },
      error: (err) => {
        const msg = err.error || "Export failed";
        this.toastr.error(msg, "Export Error");
      }
    });
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
}
