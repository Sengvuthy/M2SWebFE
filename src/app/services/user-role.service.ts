//user-role.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UserRoleDTO {
  userId: number;
  userName?: string;
  roleId: number;
  roleName?: string;
}

@Injectable({ providedIn: 'root' })
export class UserRoleService {
  private baseUrl = 'http://localhost:8080/';

  constructor(private http: HttpClient) { }

  getRolesByUser(userId: number): Observable<UserRoleDTO[]> {
    return this.http.get<UserRoleDTO[]>(`${this.baseUrl}user-roles/by-user/${userId}`);
  }

  getUsersByRole(roleId: number): Observable<UserRoleDTO[]> {
    return this.http.get<UserRoleDTO[]>(`${this.baseUrl}user-roles/by-role/${roleId}`);
  }

  assign(dto: UserRoleDTO): Observable<UserRoleDTO> {
    return this.http.post<UserRoleDTO>(`${this.baseUrl}user-roles/assign`, [dto]);
  }

  assignBatch(userId: number, roleIds: number[]): Observable<UserRoleDTO[]> {
    return this.http.post<UserRoleDTO[]>(`${this.baseUrl}user-roles/assign-batch`, { userId, roleIds });
  }

  remove(userId: number, roleId: number): Observable<string> {
    return this.http.delete(`${this.baseUrl}user-roles/remove`, {
      params: { userId, roleId },
      responseType: 'text'
    });
  }

  exists(userId: number, roleId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}user-roles/exists?userId=${userId}&roleId=${roleId}`);
  }

  importUserRoles(): Observable<string> {
    return this.http.post(`${this.baseUrl}user-roles/import`, {}, { responseType: 'text' });
  }

  export(): Observable<string> {
    return this.http.get(`${this.baseUrl}user-roles/export`, { responseType: 'text' });
  }

  getAllUserRoles(page: number, size: number, sortBy: string, sortDir: string, searchName: string = ''): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}user-roles/list`, {
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
