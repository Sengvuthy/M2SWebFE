// product-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { ProductService, Product } from '../../../services/product.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-list.component.html'
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  isLoading = false;

  searchKeyword = '';
  page = 1;
  limit = 30;
  totalPages = 1;

  sortBy = 'name';
  sortDir: 'asc' | 'desc' = 'asc';

  constructor(
    private productService: ProductService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    // Subscribe to query params so state persists
    this.route.queryParams.subscribe(params => {
      this.searchKeyword = params['keyword'] || '';
      this.page = +params['page'] || 1;

      const sort = params['sort'] || 'name,asc';
      const [field, dir] = sort.split(',');
      this.sortBy = field;
      this.sortDir = dir as 'asc' | 'desc';

      this.loadProducts();
    });
  }

  private updateUrl(): void {
    this.router.navigate(['/product'], {
      queryParams: {
        keyword: this.searchKeyword,
        page: this.page,
        sort: `${this.sortBy},${this.sortDir}`
      }
    });
  }

  loadProducts(): void {
    this.isLoading = true;
    this.productService.searchProducts(
      this.searchKeyword,
      null,
      this.page,
      this.limit,
      `${this.sortBy},${this.sortDir}`
    ).subscribe({
      next: res => {
        this.products = res.list;
        this.totalPages = res.paginationDTO.totalPages; // ✅ fix here
        this.isLoading = false;
      },
      error: err => {
        this.isLoading = false;
        this.toastr.error('Failed to load products', 'Error');
        console.error('Error fetching products:', err);
      }
    });
  }

  search(): void {
    this.page = 1;
    this.updateUrl();
  }

  clearSearch(): void {
    this.searchKeyword = '';
    this.page = 1;
    this.updateUrl();
  }

  sort(column: string): void {
    if (this.sortBy === column) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.sortDir = 'asc';
    }
    this.page = 1;
    this.updateUrl();
  }

  nextPage(): void {
    if (this.page < this.totalPages) {
      this.page++;
      this.updateUrl();
    }
  }

  prevPage(): void {
    if (this.page > 1) {
      this.page--;
      this.updateUrl();
    }
  }

  goToPage(p: number): void {
    this.page = p;
    this.updateUrl();
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

  create(): void {
    this.router.navigate(['/product/form'], {
      queryParams: {
        keyword: this.searchKeyword,
        page: this.page,
        sort: `${this.sortBy},${this.sortDir}`
      }
    });
  }

  edit(barcode: string): void {
    this.router.navigate(['/product/form', barcode], {
      queryParams: {
        keyword: this.searchKeyword,
        page: this.page,
        sort: `${this.sortBy},${this.sortDir}`
      }
    });
  }

  delete(barcode: string): void {
    if (!confirm('Delete this product?')) return;
    this.productService.delete(barcode).subscribe({
      next: msg => {
        this.toastr.success(msg);
        this.loadProducts();
      },
      error: err => this.toastr.error(err.error?.message || 'Delete failed')
    });
  }

  import(): void {
    this.productService.importExcel().subscribe({
      next: msg => {
        this.toastr.success(msg);
        this.loadProducts();
      },
      error: err => this.toastr.error(err.error?.message || 'Import failed')
    });
  }

  export(): void {
    this.productService.exportExcel().subscribe({
      next: msg => this.toastr.success(msg),
      error: err => this.toastr.error(err.error?.message || 'Export failed')
    });
  }
}
