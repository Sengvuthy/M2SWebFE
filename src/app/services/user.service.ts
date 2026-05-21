//user.service.ts
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) { }

  // 🔐 Authentication
  login(loginData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/login`, loginData);
  }

  refresh(): Observable<any> {
    const refreshToken = localStorage.getItem("refreshToken");
    return this.http.post(`${this.baseUrl}/auth/refresh`, { refreshToken });
  }

  logout(): void {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("username");
  }

  // 👤 User management
  createUser(user: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/users`, user);
  }

  getById(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/users/${id}`);
  }

  getUserList(params: HttpParams): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/users/search`, { params });
  }

  getAllUsers(): Observable<any> {
    const params = new HttpParams()
      .set("page", "1")
      .set("size", "1000")
      .set("sort", "id,asc");

    return this.http.get<any>(`${this.baseUrl}/users/search`, { params });
  }

  updateUser(id: number, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/users/${id}`, data);
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/users/${id}`, { responseType: 'text' });
  }

  // 📥 Import users via Excel
  importUsers(): Observable<any> {
    return this.http.post(`${this.baseUrl}/excel/users/import`, {}, { responseType: 'text' });
  }
}
