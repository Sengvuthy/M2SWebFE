//category-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CategoryService } from '../../../services/category.service';
import { HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-category-list',
  standalone: false,
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.css']
})
export class CategoryListComponent implements OnInit {

  categories: any[] = [];
  isLoading = true;

  page = 1;
  limit = 15;
  totalPages = 1;

  searchName = '';

  sortBy = 'name';
  sortDir: 'asc' | 'desc' = 'asc';

  constructor(
    private categoryService: CategoryService,
    private router: Router,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories() {
    this.isLoading = true;

    const name = this.searchName.trim();

    let params = new HttpParams()
      .set("page", this.page.toString())
      .set("size", this.limit.toString())
      .set("sort", `${this.sortBy},${this.sortDir}`);

    if (name) {
      params = params.set("name", name);
    }

    this.categoryService.getCategoryList(params).subscribe({
      next: (res) => {
        const list = res.list;
        const totalPages = res.paginationDTO.totalPages;

        if (list.length === 0 && this.page > 1) {
          this.page = 1;
          return this.loadCategories();
        }

        this.categories = list;
        this.totalPages = totalPages;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        console.error("Error fetching categories:", err);
      }
    });
  }

  resetAndLoad() {
    this.page = 1;
    this.loadCategories();
  }

  sort(column: string) {
    if (this.sortBy === column) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.sortDir = 'asc';
    }
    this.resetAndLoad();
  }

  nextPage() {
    if (this.page < this.totalPages) {
      this.page++;
      this.loadCategories();
    }
  }

  prevPage() {
    if (this.page > 1) {
      this.page--;
      this.loadCategories();
    }
  }

  goToPage(p: number) {
    this.page = p;
    this.loadCategories();
  }

  search() {
    this.resetAndLoad();
  }

  clearSearch() {
    this.searchName = '';
    this.resetAndLoad();
  }

  goToCreateCategory() {
    this.router.navigate(['/category/form']);
  }

  editCategory(id: number) {
    this.router.navigate(['/category/form', id]);
  }

  deleteCategory(id: number) {
    if (!confirm(`Are you sure you want to delete category ID "${id}"?`)) {
      return;
    }

    this.categoryService.deleteCategory(id).subscribe({
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

  importCategories() {
    this.categoryService.importCategories().subscribe({
      next: res => {
        this.toastr.success("Categories imported successfully!", "Import Success");
        this.loadCategories();
      },
      error: err => {
        const msg = err.error || "Import failed";
        this.toastr.error(msg, "Import Error");
      }
    });
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
}
