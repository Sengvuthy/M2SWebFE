import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface CustomerDTO {
  id?: number;
  name: string;
  phone: string;
  email: string;
  address?: string;
  isDefault?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class CustomerService {

  private baseUrl = "http://localhost:8080/";

  constructor(private http: HttpClient) {}

  // ✅ Create customer
  createCustomer(customer: CustomerDTO): Observable<CustomerDTO> {
    return this.http.post<CustomerDTO>(`${this.baseUrl}customers`, customer);
  }

  // ✅ Get customer by ID
  getById(id: number): Observable<CustomerDTO> {
    return this.http.get<CustomerDTO>(`${this.baseUrl}customers/${id}`);
  }

  // ✅ Paginated + searchable list
  getCustomerList(params: HttpParams): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}customers/search`, { params });
  }

  // ✅ Update customer by ID
  updateCustomer(id: number, data: CustomerDTO): Observable<CustomerDTO> {
    return this.http.put<CustomerDTO>(`${this.baseUrl}customers/${id}`, data);
  }

  // ✅ Delete customer by ID
  deleteCustomer(id: number): Observable<string> {
    return this.http.delete(`${this.baseUrl}customers/${id}`, { responseType: 'text' });
  }

  // ✅ Import customers from Excel
  importCustomers(): Observable<any> {
    return this.http.post(`${this.baseUrl}api/excel/customers/import`, {}, { responseType: 'json' });
  }

  // ✅ Export customers to Excel
  exportCustomers(): Observable<any> {
    return this.http.post(`${this.baseUrl}api/excel/customers/export`, {}, { responseType: 'json' });
  }
}
