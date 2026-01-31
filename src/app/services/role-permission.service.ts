//role-permission.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

export interface RolePermissionDTO {
  roleId: number;
  roleName?: string;
  permissionId: number;
  permissionName?: string;
}

// Define a DTO for permissions
export interface PermissionDTO {
  id: number;
  permissionName: string;
  description?: string;
}

export interface PagedResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

@Injectable({ providedIn: 'root' })
export class RolePermissionService {
  private baseUrl = 'http://localhost:8080/';

  constructor(private http: HttpClient) { }

  // ✅ Get all permissions for a role (no pagination)
  getPermissionsByRole(roleId: number) {
    return this.http.get<RolePermissionDTO[]>(`${this.baseUrl}role-permissions/by-role/${roleId}`);
  }

  // ✅ Get all roles for a permission (no pagination)
  getRolesByPermission(permissionId: number) {
    return this.http.get<RolePermissionDTO[]>(`${this.baseUrl}role-permissions/by-permission/${permissionId}`);
  }

  // ✅ Assign a single permission to a role
  assign(dto: RolePermissionDTO) {
    return this.http.post<RolePermissionDTO>(`${this.baseUrl}role-permissions/assign`, dto);
  }

  // ✅ Assign multiple permissions to a role
  assignBatch(roleId: number, permissionIds: number[]) {
    return this.http.post<RolePermissionDTO[]>(`${this.baseUrl}role-permissions/assign-batch`, {
      roleId,
      permissionIds
    });
  }

  // ✅ Remove a permission from a role
  remove(roleId: number, permissionId: number) {
    return this.http.delete(`${this.baseUrl}role-permissions/remove?roleId=${roleId}&permissionId=${permissionId}`);
  }

  // ✅ Check if a mapping exists
  exists(roleId: number, permissionId: number) {
    return this.http.get<boolean>(`${this.baseUrl}role-permissions/exists?roleId=${roleId}&permissionId=${permissionId}`);
  }

  // ✅ Import role-permission mappings from Excel
  importRolePermissions() {
    return this.http.post(`${this.baseUrl}role-permissions/import`, {}, { responseType: 'text' });
  }

  // ✅ Export role-permission mappings to Excel
  export() {
    return this.http.get(`${this.baseUrl}role-permissions/export`, { responseType: 'text' });
  }

  // ✅ Paginated endpoints
  getAllRolePermissions(page: number, size: number, sortBy: string, sortDir: string) {
    return this.http.get<any>(`${this.baseUrl}role-permissions/list`, {
      params: { page, size, sortBy, sortDir }
    });
  }

  getPermissionList() {
    return this.http.get<PermissionDTO[]>(`${this.baseUrl}permissions`);
  }

  getPermissionsByRolePaged(roleId: number, page: number, size: number, sortBy: string, sortDir: string) {
    return this.http.get<any>(`${this.baseUrl}role-permissions/by-role/${roleId}/paged`, {
      params: { page, size, sortBy, sortDir }
    });
  }

  getRolesByPermissionPaged(permissionId: number, page: number, size: number, sortBy: string, sortDir: string) {
    return this.http.get<any>(`${this.baseUrl}role-permissions/by-permission/${permissionId}/paged`, {
      params: { page, size, sortBy, sortDir }
    });
  }

  // 🔹 NEW: Get all permissions (for dropdowns)
  getAllPermissions() {
    return this.http.get<PermissionDTO[]>(`${this.baseUrl}permissions`);
  }
}
