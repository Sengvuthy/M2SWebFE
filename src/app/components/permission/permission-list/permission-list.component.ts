//permission-list.component.ts
import { Component, OnInit } from '@angular/core';
import { PermissionService, PermissionDTO } from '../../../services/permission.service';
import { HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-permission-list',
  templateUrl: './permission-list.component.html',
  styleUrls: ['./permission-list.component.css'],
  standalone: false
})
export class PermissionListComponent implements OnInit {
  permissions: PermissionDTO[] = [];
  isLoading = true;

  page = 1;
  limit = 30;
  totalPages = 1;

  sortBy = 'id';
  sortDir: 'asc' | 'desc' = 'asc';

  constructor(
    private permissionService: PermissionService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadPermissions();
  }

  loadPermissions() {
    this.isLoading = true;

    let params = new HttpParams()
      .set('page', this.page.toString())
      .set('size', this.limit.toString())
      .set('sort', `${this.sortBy},${this.sortDir}`);

    this.permissionService.getPermissionList(params).subscribe({
      next: (res) => {
        const list: PermissionDTO[] = res.list;
        const totalPages: number = res.paginationDTO.totalPages;

        if (list.length === 0 && this.page > 1) {
          this.page = 1;
          return this.loadPermissions();
        }

        this.permissions = list;
        this.totalPages = totalPages;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error fetching permissions:', err);
      }
    });
  }

  resetAndLoad() { this.page = 1; this.loadPermissions(); }

  sort(column: string) {
    if (this.sortBy === column) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.sortDir = 'asc';
    }
    this.resetAndLoad();
  }

  nextPage() { if (this.page < this.totalPages) { this.page++; this.loadPermissions(); } }
  prevPage() { if (this.page > 1) { this.page--; this.loadPermissions(); } }
  goToPage(p: number) { this.page = p; this.loadPermissions(); }

  goToCreatePermission() { this.router.navigate(['/permission/form']); }
  editPermission(id: number) { this.router.navigate(['/permission/form', id]); }

  deletePermission(id: number) {
    if (!confirm(`Are you sure you want to delete permission ID ${id}?`)) return;
    this.permissionService.deletePermission(id).subscribe({
      next: res => {
        this.toastr.success(res, 'Delete Success');
        this.resetAndLoad();
      },
      error: err => {
        const msg = err.error?.message || 'Delete failed';
        this.toastr.error(msg, 'Delete Error');
      }
    });
  }

  importPermissions() {
    this.permissionService.importPermissions().subscribe({
      next: () => {
        this.toastr.success('Permissions imported successfully!', 'Import Success');
        this.loadPermissions();
      },
      error: err => {
        const msg = err.error || 'Import failed';
        this.toastr.error(msg, 'Import Error');
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
