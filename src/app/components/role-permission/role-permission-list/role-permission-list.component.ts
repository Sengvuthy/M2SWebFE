//role-permission-list.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { RolePermissionService, RolePermissionDTO, PagedResponse } from '../../../services/role-permission.service';
import { RoleService } from '../../../services/role.service';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './role-permission-list.component.html'
})
export class RolePermissionListComponent implements OnInit {
  roles: { id: number; roleName: string }[] = [];
  roleId!: number;

  roleControl = new FormControl(); // ✅ reactive control for dropdown

  mappings: RolePermissionDTO[] = [];
  isLoading = true;
  errorMsg = '';

  page = 1;
  limit = 30;
  totalPages = 1;

  sortBy = 'id.permissionId';
  sortDir: 'asc' | 'desc' = 'asc';

  constructor(
    private service: RolePermissionService,
    private roleService: RoleService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.loadRoles();

    // ✅ Sync with query param
    this.route.queryParamMap.subscribe(params => {
      const qpId = Number(params.get('roleId'));
      this.roleId = qpId || 1;
      this.roleControl.setValue(this.roleId, { emitEvent: false });
      this.page = 1;
      this.loadMappings();
    });

    // ✅ React to dropdown changes
    this.roleControl.valueChanges.subscribe(val => {
      if (val) {
        this.router.navigate(['/role-permission'], { queryParams: { roleId: val } });
      }
    });
  }

  loadRoles(): void {
    this.roleService.getAllRoles().subscribe({
      next: res => {
        const raw = res.list ?? res.content ?? res;
        this.roles = raw.map((r: any) => ({
          id: r.id ?? r.roleId,
          roleName: r.roleName ?? r.name
        }));
      },
      error: () => {
        this.toastr.error('Failed to load roles');
      }
    });
  }

  loadMappings(): void {
    this.isLoading = true;
    this.service.getPermissionsByRolePaged(
      this.roleId,
      this.page - 1,
      this.limit,
      this.sortBy,
      this.sortDir
    ).subscribe({
      next: (res: PagedResponse<RolePermissionDTO>) => {
        this.mappings = res.content;
        this.totalPages = res.totalPages;
        this.isLoading = false;
      },
      error: err => {
        this.errorMsg = err?.error?.message || 'Failed to load role-permissions';
        this.toastr.error(this.errorMsg, 'Error');
        this.isLoading = false;
      }
    });
  }

  sort(column: string): void {
    if (this.sortBy === column) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.sortDir = 'asc';
    }
    this.page = 1;
    this.loadMappings();
  }

  remove(mapping: RolePermissionDTO): void {
    if (!confirm(`Remove permission "${mapping.permissionName ?? mapping.permissionId}" from role "${mapping.roleName ?? mapping.roleId}"?`)) return;

    this.service.remove(mapping.roleId, mapping.permissionId).subscribe({
      next: () => {
        this.toastr.success('Permission removed successfully', 'Success');
        this.loadMappings();
      },
      error: err => {
        const msg = err?.error?.message || 'Delete failed';
        this.toastr.error(msg, 'Error');
      }
    });
  }

  importRolePermissions(): void {
    this.isLoading = true;
    this.service.importRolePermissions().subscribe({
      next: (msg) => {
        this.toastr.success(msg, 'Import Complete');
        this.loadMappings(); // 🔄 refresh table
        this.isLoading = false;
      },
      error: (err) => {
        const errorMsg = err?.error?.message || 'Import failed';
        this.toastr.error(errorMsg, 'Error');
        this.isLoading = false;
      }
    });
  }

  goToAssign(): void {
    this.router.navigate(['/role-permission/form', this.roleId]);
  }

  nextPage(): void {
    if (this.page < this.totalPages) {
      this.page++;
      this.loadMappings();
    }
  }

  prevPage(): void {
    if (this.page > 1) {
      this.page--;
      this.loadMappings();
    }
  }

  goToPage(p: number): void {
    this.page = p;
    this.loadMappings();
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
