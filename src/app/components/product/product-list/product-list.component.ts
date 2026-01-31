// product-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { ProductService, Product, PageDTO } from '../../../services/product.service';
import { HttpParams } from '@angular/common/http';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-list.component.html'
})
export class ProductListComponent implements OnInit {
  products: any[] = [];
  isLoading = false;

  page = 1;
  limit = 15;
  totalPages = 1;

  searchName = '';
  sortBy = 'name';
  sortDir: 'asc' | 'desc' = 'desc';

  constructor(
    private productService: ProductService,
    private router: Router,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoading = true;

    let params = new HttpParams()
      .set('_page', this.page.toString())
      .set('_limit', this.limit.toString())
      .set('sort', `${this.sortBy},${this.sortDir}`);

    if (this.searchName.trim() !== '') {
      params = params.set('name', this.searchName.trim());
    }

    this.productService.getAllProducts(params).subscribe({
      next: (res) => {
        this.products = res.list;
        this.totalPages = res.paginationDTO.totalPages;
        this.isLoading = false;
      },
      error: err => {
        this.isLoading = false;
        this.toastr.error('Failed to load products', 'Error');
        console.error('Error fetching products:', err);
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
    this.loadProducts();
  }

  nextPage() {
    if (this.page < this.totalPages) {
      this.page++;
      this.loadProducts();
    }
  }

  prevPage() {
    if (this.page > 1) {
      this.page--;
      this.loadProducts();
    }
  }

  goToPage(p: number) {
    this.page = p;
    this.loadProducts();
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }


  search(): void {
    this.page = 1;
    this.loadProducts();
  }

  clearSearch(): void {
    this.searchName = '';
    this.search();
  }
 
  create(): void {
    this.router.navigate(['/product/form']);
  }

  edit(barcode: string): void {
    this.router.navigate(['/product/form', barcode]);
  }

  import(): void {
    this.productService.importExcel().subscribe({
      next: msg => { this.toastr.success(msg); this.loadProducts(); },
      error: err => this.toastr.error(err.error?.message || 'Import failed')
    });
  }

  export(): void {
    this.productService.exportExcel().subscribe({
      next: msg => this.toastr.success(msg),
      error: err => this.toastr.error(err.error?.message || 'Export failed')
    });
  }

  delete(barcode: string): void {
    if (!confirm('Delete this product?')) return;
    this.productService.delete(barcode).subscribe({
      next: msg => { this.toastr.success(msg); this.loadProducts(); },
      error: err => this.toastr.error(err.error?.message || 'Delete failed')
    });
  }
}
