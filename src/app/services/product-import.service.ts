//product-import.service.ts
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface ProductImportItem {
  barcode: string;
  productName: string;
  importUnit: number;
  buyPrice: number;
  salePrice: number;
  buyAmount?: number;   // per‑item subtotal
}

export interface ProductImportDTO {
  importId: string;
  supplierName: string;
  importerName: string;
  importDate: string;
  importTime: string;
  items: ProductImportItem[];
  totalBuyAmount?: number;   // grand total
}

@Injectable({
  providedIn: 'root'
})
export class ProductImportService {
  private baseUrl = 'http://localhost:8080';

  constructor(private http: HttpClient) { }

  // 🔹 Create a new product import
  createProductImport(productImport: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/product-imports`, productImport);
  }

  // 🔹 Update an existing product import
  updateProductImport(productImport: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/product-imports/update`, productImport);
  }

  // 🔹 Cancel a product import by ID
  cancelProductImport(importId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/product-imports/cancel`, { importId });
  }

  // 🔹 Get product import by importID
  getProductImportByImportId(importId: string): Observable<ProductImportDTO> {
    return this.http.get<ProductImportDTO>(`${this.baseUrl}/product-imports/importId/${importId}`);
  }

  // 🔹 Get product imports list with pagination + sorting
  getProductImportsList(params: HttpParams): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/product-imports/list`, { params });
  }

  // 🔹 Get import IDs list (search)
  getImportIdList(params: HttpParams): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/product-imports/search`, { params });
  }

// 🔹 Get product imports by date
  getProductImportsByDate(date: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/product-imports/date/${date}`);
  }

  // 🔹 Get product imports by date range
  getProductImportsByDateRange(start: string, end: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/product-imports/range?start=${start}&end=${end}`);
  }

  // 🔹 Search product imports by keyword
  searchProductImports(keyword: string): Observable<any> {
    return this.http.get<any[]>(`${this.baseUrl}/product-imports/search-by-keyword`, {
      params: { keyword }
    });
  }
  
  // 🔹 Import product imports from Excel
  importProductImports(): Observable<any> {
    return this.http.post(`${this.baseUrl}/product-imports/import`, {}, { responseType: 'text' });
  }

  // 🔹 Export product imports to Excel
  exportProductImports(): Observable<any> {
    return this.http.get(`${this.baseUrl}/product-imports/export`, { responseType: 'text' });
  }

  // 🔹 Export income for a specific date
  exportIncomeForDate(date: string) {
    return this.http.post(`/product-imports/export-income/${date}`, null);
  }
}
