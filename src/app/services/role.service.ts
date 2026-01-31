//role.service.ts
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface RoleDTO {
  id: number;              // required for responses
  roleName: string;
  description?: string;
}

@Injectable({ providedIn: 'root' })
export class RoleService {

  private baseUrl = "http://localhost:8080/";

  constructor(private http: HttpClient) { }

  // Create (no id in payload)
  createRole(data: Omit<RoleDTO, 'id'>): Observable<RoleDTO> {
    return this.http.post<RoleDTO>(`${this.baseUrl}roles`, data);
  }

  // Get by ID
  getRoleById(id: number): Observable<RoleDTO> {
    return this.http.get<RoleDTO>(`${this.baseUrl}roles/${id}`);
  }

  // Paginated list
  getRoleList(params: HttpParams): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}roles/search`, { params });
  }

  // for Using in User-Role
  getAllRoles(): Observable<any> {
    const params = new HttpParams()
      .set("page", "1")
      .set("size", "1000")
      .set("sort", "id,asc");

    return this.http.get<any>(`${this.baseUrl}roles/search`, { params });
  }

  // Update by ID
  updateRole(id: number, data: Omit<RoleDTO, 'id'>): Observable<RoleDTO> {
    return this.http.put<RoleDTO>(`${this.baseUrl}roles/${id}`, data);
  }

  // Delete by ID
  deleteRole(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}roles/${id}`, { responseType: 'text' });
  }

  // Import from Excel
  importRoles(): Observable<any> {
    return this.http.post(`${this.baseUrl}roles/import`, {}, { responseType: 'text' });
  }
}
