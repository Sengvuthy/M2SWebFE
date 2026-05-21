//permission.service.ts
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface PermissionDTO {
  id: number;              // required for responses
  permissionName: string;
  description?: string;
}

@Injectable({ providedIn: 'root' })
export class PermissionService {
  private baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  // ✅ Create (no id in payload)
  createPermission(data: Omit<PermissionDTO, 'id'>): Observable<PermissionDTO> {
    return this.http.post<PermissionDTO>(`${this.baseUrl}/permissions`, data);
  }

  // ✅ Get by ID
  getPermissionById(id: number): Observable<PermissionDTO> {
    return this.http.get<PermissionDTO>(`${this.baseUrl}/permissions/${id}`);
  }

  // ✅ Paginated list (search + paging)
  getPermissionList(params: HttpParams): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/permissions/search`, { params });
  }

  // ✅ Non-paginated list (for dropdowns)
  getAllPermissions(): Observable<PermissionDTO[]> {
    return this.http.get<PermissionDTO[]>(`${this.baseUrl}/permissions`);
  }

  // ✅ Update by ID (no id in payload)
  updatePermission(id: number, data: Omit<PermissionDTO, 'id'>): Observable<PermissionDTO> {
    return this.http.put<PermissionDTO>(`${this.baseUrl}/permissions/${id}`, data);
  }

  // ✅ Delete by ID
  deletePermission(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/permissions/${id}`, { responseType: 'text' });
  }

  // ✅ Import from Excel
  importPermissions(): Observable<any> {
    return this.http.post(`${this.baseUrl}/permissions/import`, {}, { responseType: 'text' });
  }
}
