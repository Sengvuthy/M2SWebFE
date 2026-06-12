// product.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// Product DTO
export interface Product {
  barcode: string;
  name: string;
  khmerName: string;
  categoryId: number;
  supplierId: number;
  availableUnit?: number;
  buyPrice?: number;
  salePrice?: number;
  imagePath?: string;
  categoryName?: string;
  supplierName?: string;
  selectedQty?: number;
}

export interface PaginationDTO {
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface PageDTO<T> {
  list: T[];
  paginationDTO: PaginationDTO;
}

// Product Import DTO
export interface ProductImport {
  id: number;
  productBarcode: string;
  productName: string;
  khmerName: string;
  importUnit: number;
  buyPrice: number;
  salePrice: number;
  importDate: string;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly baseUrl = environment.apiBaseUrl;
  private readonly backendUrl = environment.backendUrl;

  constructor(private http: HttpClient) { }

  uploadImage(file: File, barcode: string): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post(`${this.baseUrl}/products/${barcode}/upload-image`, formData, { responseType: 'text' })
      .pipe(map(filename => this.buildImageUrl(filename)));
  }

  // ✅ Create product
  create(product: Product): Observable<Product> {
    return this.http.post<Product>(`${this.baseUrl}/products`, product);
  }

  // ✅ Update product by barcode
  update(barcode: string, product: Product): Observable<Product> {
    return this.http.put<Product>(`${this.baseUrl}/products/${barcode}`, product);
  }

  // ✅ Get product by barcode
  getByBarcode(barcode: string): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/products/${barcode}`);
  }

  // ✅ Delete product by barcode
  delete(barcode: string): Observable<string> {
    return this.http.delete(`${this.baseUrl}/products/${barcode}`, { responseType: 'text' });
  }

  // ✅ Search products (paginated + filter by name, optional lat/lng)
  searchProducts(
    keyword: string | null,
    categoryId?: number | null,   // ✅ optional
    page?: number,
    size?: number,
    sort?: string
  ): Observable<PageDTO<Product>> {
    let params = new HttpParams();

    if (page !== undefined) params = params.set('page', page.toString());
    if (size !== undefined) params = params.set('size', size.toString());
    if (sort !== undefined) params = params.set('sort', sort);

    if (keyword && keyword.trim() !== '') {
      params = params.set('keyword', keyword.trim());
    }

    if (categoryId !== undefined && categoryId !== null) {
      params = params.set('categoryId', categoryId.toString());
    }

    return this.http.get<PageDTO<Product>>(`${this.baseUrl}/products`, { params });
  }

  // ✅ Get all products (for dropdowns, large size, sorted by name)
  getAllProducts(params: HttpParams): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/products/search`, { params });
  }

  // ✅ Import products from Excel
  importExcel(): Observable<string> {
    return this.http.post(`${this.baseUrl}/products/import`, {}, { responseType: 'text' });
  }

  // ✅ Export products to Excel
  exportExcel(): Observable<string> {
    return this.http.get(`${this.baseUrl}/products/export`, { responseType: 'text' });
  }

  // ✅ Import history by barcode
  getImportHistoryByBarcode(barcode: string): Observable<ProductImport[]> {
    return this.http.get<ProductImport[]>(`${this.baseUrl}/products/import-history/barcode/${encodeURIComponent(barcode)}`);
  }

  // ✅ Import history by product name
  getImportHistoryByName(name: string): Observable<ProductImport[]> {
    return this.http.get<ProductImport[]>(`${this.baseUrl}/products/import-history/name/${encodeURIComponent(name)}`);
  }

  buildImageUrl(filename?: string): string {
    if (!filename) return '';
    const cleanBackend = this.backendUrl.replace(/\/$/, '');
    const cleanFile = filename.replace(/^\/+/, '');
    return `${cleanBackend}/uploads/products/${encodeURIComponent(cleanFile)}`;
  }

  normalizeImagePath(product: Product): Product {
    if (product.imagePath && !product.imagePath.startsWith('http')) {
      product.imagePath = this.buildImageUrl(product.imagePath);
    }
    return product;
  }

  normalizeImagePaths(products: Product[]): Product[] {
    return products.map(p => this.normalizeImagePath(p));
  }
}
