import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface SellerDTO {
  id: number;              // ✅ required now
  name: string;
  employeeCode?: string;
  phone?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SellerService {
  private baseUrl = "http://localhost:8080/";

  constructor(private http: HttpClient) {}

  // ✅ Create
  createSeller(seller: Omit<SellerDTO, 'id'>): Observable<any> {
    return this.http.post(`${this.baseUrl}sellers`, seller);
  }

  // ✅ Get by ID
  getById(id: number): Observable<SellerDTO> {
    return this.http.get<SellerDTO>(`${this.baseUrl}sellers/${id}`);
  }

  // ✅ Paginated + searchable list
  getSellerList(params?: HttpParams): Observable<any> {
    return this.http.get(`${this.baseUrl}sellers/search`, { params });
  }

  // ✅ Update by ID
  updateSeller(id: number, data: Omit<SellerDTO, 'id'>): Observable<any> {
    return this.http.put(`${this.baseUrl}sellers/${id}`, data);
  }

  // ✅ Delete by ID
  deleteSeller(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}sellers/${id}`, { responseType: 'text' });
  }

  // 📥 Import from Excel
  importSellers(): Observable<any> {
    return this.http.post(`${this.baseUrl}api/excel/sellers/import`, {}, { responseType: 'json' });
  }

  // 📤 Export to Excel
  exportSellers(): Observable<any> {
    return this.http.post(`${this.baseUrl}api/excel/sellers/export`, {}, { responseType: 'json' });
  }
}
