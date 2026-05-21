//seller-list.component.ts
import { Component, OnInit } from '@angular/core';
import { SellerService, SellerDTO } from '../../../services/seller.service';
import { HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-seller-list',
  templateUrl: './seller-list.component.html',
  styleUrls: ['./seller-list.component.css'],
  standalone: false
})
export class SellerListComponent implements OnInit {

  sellers: SellerDTO[] = [];
  isLoading = true;

  page = 1;
  limit = 30;
  totalPages = 1;

  searchName = '';
  sortBy = 'id';
  sortDir: 'asc' | 'desc' = 'asc';

  constructor(
    private sellerService: SellerService,
    private router: Router,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.loadSellers();
  }

  loadSellers() {
    this.isLoading = true;

    let params = new HttpParams()
      .set("_page", this.page.toString())
      .set("_limit", this.limit.toString())
      .set("_sortBy", this.sortBy)
      .set("_sortDir", this.sortDir);

    if (this.searchName.trim() !== '') {
      params = params.set("name", this.searchName.trim());
    }

    this.sellerService.getSellerList(params).subscribe({
      next: (res) => {
        const sellers: SellerDTO[] = res.list;
        const totalPages = res.paginationDTO.totalPages;

        if (sellers.length === 0 && this.page > 1) {
          this.page = 1;
          this.loadSellers();
          return;
        }

        this.sellers = sellers;
        this.totalPages = totalPages;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.toastr.error("Failed to fetch sellers", "Error");
        console.error("Error fetching sellers:", err);
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
    this.loadSellers();
  }

  nextPage() { if (this.page < this.totalPages) { this.page++; this.loadSellers(); } }
  prevPage() { if (this.page > 1) { this.page--; this.loadSellers(); } }
  goToPage(p: number) { this.page = p; this.loadSellers(); }

  search() { this.page = 1; this.loadSellers(); }
  clearSearch() { this.searchName = ''; this.page = 1; this.loadSellers(); }

  goToCreateSeller() { this.router.navigate(['/seller/form']); }
  editSeller(id: number) { this.router.navigate(['/seller/form', id]); }

  deleteSeller(id: number) {
    this.sellerService.deleteSeller(id).subscribe({
      next: res => {
        const msg = res || "Seller deleted successfully";
        this.toastr.success(msg, "Delete Success");
        this.clearSearch();
      },
      error: err => {
        const msg = err.error?.message || "Delete failed";
        this.toastr.error(msg, "Delete Error");
      }
    });
  }

  importSellers() {
    this.sellerService.importSellers().subscribe({
      next: () => {
        this.toastr.success("Sellers imported successfully!", "Import Success");
        this.loadSellers();
      },
      error: () => this.toastr.error("Import failed", "Import Error")
    });
  }

  exportSellers() {
    this.sellerService.exportSellers().subscribe({
      next: () => {
        this.toastr.success("Sellers exported successfully!", "Export Success");
      },
      error: () => this.toastr.error("Export failed", "Export Error")
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
