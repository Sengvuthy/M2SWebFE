//user-role.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface UserRoleDTO {
  userId: number;
  userName?: string;
  roleId: number;
  roleName?: string;
}

@Injectable({ providedIn: 'root' })
export class UserRoleService {
  private baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) { }

  // ✅ Get all roles for a user
  getRolesByUser(userId: number): Observable<UserRoleDTO[]> {
    return this.http.get<UserRoleDTO[]>(`${this.baseUrl}/user-roles/by-user/${userId}`);
  }

  // ✅ Get all users for a role
  getUsersByRole(roleId: number): Observable<UserRoleDTO[]> {
    return this.http.get<UserRoleDTO[]>(`${this.baseUrl}/user-roles/by-role/${roleId}`);
  }

  // ✅ Assign a single role to a user
  assign(dto: UserRoleDTO): Observable<UserRoleDTO> {
    return this.http.post<UserRoleDTO>(`${this.baseUrl}/user-roles/assign`, [dto]);
  }

  // ✅ Assign multiple roles to a user
  assignBatch(userId: number, roleIds: number[]): Observable<UserRoleDTO[]> {
    return this.http.post<UserRoleDTO[]>(`${this.baseUrl}/user-roles/assign-batch`, { userId, roleIds });
  }

  // ✅ Remove a role from a user
  remove(userId: number, roleId: number): Observable<string> {
    return this.http.delete(`${this.baseUrl}/user-roles/remove`, {
      params: { userId, roleId },
      responseType: 'text'
    });
  }

  // ✅ Check if a mapping exists
  exists(userId: number, roleId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}/user-roles/exists?userId=${userId}&roleId=${roleId}`);
  }

  // ✅ Import user-role mappings from Excel
  importUserRoles(): Observable<string> {
    return this.http.post(`${this.baseUrl}/user-roles/import`, {}, { responseType: 'text' });
  }

  // ✅ Export user-role mappings to Excel
  export(): Observable<string> {
    return this.http.get(`${this.baseUrl}/user-roles/export`, { responseType: 'text' });
  }

  // ✅ Paginated list of user-role mappings
  getAllUserRoles(page: number, size: number, sortBy: string, sortDir: string, searchName: string = ''): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/user-roles/list`, {
      params: {
        page: page.toString(),
        size: size.toString(),
        sortBy,
        sortDir,
        searchName
      }
    });
  }
}
