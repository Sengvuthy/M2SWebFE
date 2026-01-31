//user.service.ts
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class UserService {
  private url = "http://localhost:8080/";

  constructor(private http: HttpClient) { }

  createUser(user: any) {
    return this.http.post(this.url + "users", user);
  }

  logout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("username");
  }

  login(loginData: any): Observable<any> {
    return this.http.post(this.url + "auth/login", loginData);
  }

  refresh(): Observable<any> {
    const refreshToken = localStorage.getItem("refreshToken");
    return this.http.post(this.url + "auth/refresh", { refreshToken });
  }

  getById(id: number) {
    return this.http.get<any>(this.url + "users/" + id);
  }

  getUserList(params: HttpParams) {
    return this.http.get<any>(this.url + "users/search", { params });
  }

  // for using in User-Role
  getAllUsers(): Observable<any> {
    const params = new HttpParams()
      .set("page", "1")
      .set("size", "1000")
      .set("sort", "id,asc");

    return this.http.get<any>(`${this.url}users/search`, { params });
  }

  updateUser(id: number, data: any) {
    return this.http.put(this.url + `users/${id}`, data);
  }

  deleteUser(id: number) {
    return this.http.delete(this.url + `users/${id}`, { responseType: 'text' });
  }

  importUsers() {
    return this.http.post(this.url + "api/excel/users/import", {}, { responseType: 'text' });
  }
}
