//category.service.ts
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  // ✅ Create new category
  createCategory(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/categories`, data);
  }

  // ✅ Get category by ID
  getCategoryById(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/categories/${id}`);
  }

  // ✅ Paginated + searchable list (for tables)
  getCategoryList(params?: HttpParams): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/categories/search`, { params });
  }

  // ✅ Get full category list for dropdowns
  getAllCategories(): Observable<any> {
    const params = new HttpParams()
      .set("page", "1")
      .set("size", "1000")
      .set("sort", "name,asc");

    return this.http.get<any>(`${this.baseUrl}/categories/search`, { params });
  }

  // ✅ Update category by ID
  updateCategory(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/categories/${id}`, data);
  }

  // ✅ Delete category by ID
  deleteCategory(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/categories/${id}`, { responseType: 'text' });
  }

  // ✅ Import categories
  importCategories(): Observable<any> {
    return this.http.post(`${this.baseUrl}/categories/import`, {}, { responseType: 'text' });
  }

  // ✅ Export categories
  exportCategories(): Observable<any> {
    return this.http.get(`${this.baseUrl}/categories/export`, { responseType: 'text' });
  }
}
