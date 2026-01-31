//supplier.service.ts
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface SupplierDTO {
  id: number;
  name: string;
  phone: string;
  email: string;
  address?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SupplierService {

  private baseUrl = "http://localhost:8080/";

  constructor(private http: HttpClient) {}

  // ✅ Create supplier
  createSupplier(supplier: SupplierDTO): Observable<SupplierDTO> {
    return this.http.post<SupplierDTO>(`${this.baseUrl}suppliers`, supplier);
  }

  // ✅ Get supplier by ID
  getById(id: number): Observable<SupplierDTO> {
    return this.http.get<SupplierDTO>(`${this.baseUrl}suppliers/${id}`);
  }

  // ✅ Paginated + searchable list (for tables)
  getSupplierList(params?: HttpParams): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}suppliers/search`, { params });
  }

  // ✅ Get full supplier list for dropdowns (reuse /search with large size)
  getAllSuppliers(): Observable<any> {
    const params = new HttpParams()
      .set("page", "1")
      .set("size", "1000")   // big enough to cover all suppliers
      .set("sort", "name,asc");

    return this.http.get<any>(`${this.baseUrl}suppliers/search`, { params });
  }

  // ✅ Update supplier by ID
  updateSupplier(id: number, data: SupplierDTO): Observable<SupplierDTO> {
    return this.http.put<SupplierDTO>(`${this.baseUrl}suppliers/${id}`, data);
  }

  // ✅ Delete supplier by ID
  deleteSupplier(id: number): Observable<string> {
    return this.http.delete(`${this.baseUrl}suppliers/${id}`, { responseType: 'text' });
  }

  // ✅ Import suppliers from Excel
  importSuppliers(): Observable<string> {
    return this.http.post(`${this.baseUrl}suppliers/import`, {}, { responseType: 'text' });
  }

  // ✅ Export suppliers to Excel
  exportSuppliers(): Observable<string> {
    return this.http.get(`${this.baseUrl}suppliers/export`, { responseType: 'text' });
  }
}
