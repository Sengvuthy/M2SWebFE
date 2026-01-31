// src/app/services/product.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// Product DTO
export interface Product {
  barcode: string;
  name: string;
  categoryId: number;
  supplierId: number;
  availableUnit?: number;
  buyPrice?: number;
  salePrice?: number;
  imagePath?: string;
  categoryName?: string;
  supplierName?: string;
}

// Generic PageDTO (matches backend)
export interface PageDTO<T> {
  list: T[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

// Product Import DTO
export interface ProductImport {
  id: number;
  productBarcode: string;
  productName: string;
  importUnit: number;
  buyPrice: number;
  salePrice: number;
  importDate: string;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  // ✅ Use only the root base URL
  private readonly baseUrl = 'http://localhost:8080/';

  constructor(private http: HttpClient) {}

  // ✅ Create product
  create(product: Product): Observable<Product> {
    return this.http.post<Product>(`${this.baseUrl}products`, product);
  }

  // ✅ Update product by barcode
  update(barcode: string, product: Product): Observable<Product> {
    return this.http.put<Product>(`${this.baseUrl}products/${barcode}`, product);
  }

  // ✅ Get product by barcode
  getByBarcode(barcode: string): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}products/${barcode}`);
  }

  // ✅ Delete product by barcode
  delete(barcode: string): Observable<string> {
    return this.http.delete(`${this.baseUrl}products/${barcode}`, { responseType: 'text' });
  }

  // ✅ Search products (paginated + filter by name)
  search(name: string | null, page: number, size: number, sort: string): Observable<PageDTO<Product>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);

    if (name && name.trim() !== '') {
      params = params.set('name', name.trim());
    }

    return this.http.get<PageDTO<Product>>(`${this.baseUrl}products/search`, { params });
  }

  // ✅ Get all products (for dropdowns, large size, sorted by name)
  getAllProducts(params: HttpParams): Observable<any> {    
    return this.http.get<any>(`${this.baseUrl}products/search`, { params });
  }

  // ✅ Upload product image
  uploadImage(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.baseUrl}products/upload-image`, formData, { responseType: 'text' });
  }

  // ✅ Import products from Excel
  importExcel(): Observable<string> {
    return this.http.post(`${this.baseUrl}products/import`, {}, { responseType: 'text' });
  }

  // ✅ Export products to Excel
  exportExcel(): Observable<string> {
    return this.http.get(`${this.baseUrl}products/export`, { responseType: 'text' });
  }

  // ✅ Import history by barcode
  getImportHistoryByBarcode(barcode: string): Observable<ProductImport[]> {
    return this.http.get<ProductImport[]>(`${this.baseUrl}products/import-history/barcode/${encodeURIComponent(barcode)}`);
  }

  // ✅ Import history by product name
  getImportHistoryByName(name: string): Observable<ProductImport[]> {
    return this.http.get<ProductImport[]>(`${this.baseUrl}products/import-history/name/${encodeURIComponent(name)}`);
  }
}
