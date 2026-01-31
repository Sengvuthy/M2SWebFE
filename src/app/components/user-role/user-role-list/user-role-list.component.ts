import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserRoleService, UserRoleDTO } from '../../../services/user-role.service';
import { HttpParams } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './user-role-list.component.html'
})
export class UserRoleListComponent implements OnInit {
  userId!: number;
  mappings: UserRoleDTO[] = [];
  isLoading = true;
  errorMsg = '';

  page = 1;
  limit = 15;
  totalPages = 1;

  searchName = '';

  sortBy = 'id.userId';
  sortDir: 'asc' | 'desc' = 'asc';

  constructor(
    private userroleService: UserRoleService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    const qpId = Number(this.route.snapshot.queryParamMap.get('userId'));
    this.userId = qpId || 1;
    this.loadUserRoles();
  }

  loadUserRoles(): void {
    this.isLoading = true;

    this.userroleService.getAllUserRoles(this.page - 1, this.limit, this.sortBy, this.sortDir, this.searchName).subscribe({
      next: res => {
        this.mappings = res.content;
        this.totalPages = res.totalPages;
        this.isLoading = false;
      },
      error: err => {
        this.errorMsg = err?.error?.message || 'Failed to load user-roles';
        this.isLoading = false;
      }
    });
  }

  remove(mapping: UserRoleDTO): void {
    if (!confirm(`Remove role "${mapping.roleName ?? mapping.roleId}" from user "${mapping.userName ?? mapping.userId}"?`)) return;
    this.userroleService.remove(mapping.userId, mapping.roleId).subscribe({
      next: () => {
        this.toastr.success("Delete Success", "User-Role removed successfully");
        this.loadUserRoles();
      },
      error: err => {
        const msg = err?.error?.message || 'Delete failed';
        this.toastr.error(msg, "Delete Error");
      }
    });
  }

  resetAndLoad() {
    this.page = 1;
    this.loadUserRoles();
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
      this.loadUserRoles();
    }
  }

  prevPage() {
    if (this.page > 1) {
      this.page--;
      this.loadUserRoles();
    }
  }

  goToPage(p: number) {
    this.page = p;
    this.loadUserRoles();
  }

  search() {
    this.resetAndLoad();
  }

  clearSearch() {
    this.searchName = '';
    this.resetAndLoad();
  }

  goToAssign(): void {
    this.router.navigate(['/user-role/form', this.userId]);
  }

  importUserRoles() {
    this.userroleService.importUserRoles().subscribe({
      next: res => {
        this.toastr.success("User-Roles imported successfully!", "Import Success");
        this.loadUserRoles();
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
