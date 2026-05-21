//role-list.component.ts
import { Component, OnInit } from '@angular/core';
import { RoleService, RoleDTO } from '../../../services/role.service';
import { HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-role-list',
  templateUrl: './role-list.component.html',
  styleUrls: ['./role-list.component.css'],
  standalone: false
})
export class RoleListComponent implements OnInit {
  roles: RoleDTO[] = [];
  isLoading = true;

  page = 1;
  limit = 30;
  totalPages = 1;

  sortBy = 'id'; // ✅ default sort by ID
  sortDir: 'asc' | 'desc' = 'asc';

  constructor(
    private roleService: RoleService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles() {
    this.isLoading = true;

    let params = new HttpParams()
      .set("page", this.page.toString())
      .set("size", this.limit.toString())
      .set("sort", `${this.sortBy},${this.sortDir}`);

    this.roleService.getRoleList(params).subscribe({
      next: (res) => {
        const list: RoleDTO[] = res.list;
        const totalPages: number = res.paginationDTO.totalPages;

        if (list.length === 0 && this.page > 1) {
          this.page = 1;
          return this.loadRoles();
        }

        this.roles = list;
        this.totalPages = totalPages;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        console.error("Error fetching roles:", err);
      }
    });
  }

  resetAndLoad() { this.page = 1; this.loadRoles(); }

  sort(column: string) {
    if (this.sortBy === column) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.sortDir = 'asc';
    }
    this.resetAndLoad();
  }

  nextPage() { if (this.page < this.totalPages) { this.page++; this.loadRoles(); } }
  prevPage() { if (this.page > 1) { this.page--; this.loadRoles(); } }
  goToPage(p: number) { this.page = p; this.loadRoles(); }

  goToCreateRole() { this.router.navigate(['/role/form']); }
  editRole(id: number) { this.router.navigate(['/role/form', id]); } // ✅ use ID

  deleteRole(id: number) {
    if (!confirm(`Are you sure you want to delete role ID ${id}?`)) return;
    this.roleService.deleteRole(id).subscribe({
      next: res => { this.toastr.success(res, "Delete Success"); this.resetAndLoad(); },
      error: err => { const msg = err.error?.message || "Delete failed"; this.toastr.error(msg, "Delete Error"); }
    });
  }

  importRoles() {
    this.roleService.importRoles().subscribe({
      next: () => { this.toastr.success("Roles imported successfully!", "Import Success"); this.loadRoles(); },
      error: err => { const msg = err.error || "Import failed"; this.toastr.error(msg, "Import Error"); }
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
