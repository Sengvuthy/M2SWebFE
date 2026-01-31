//sales.service.ts
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface SaleItem {
  barcode: string;
  productName: string;
  numberOfUnit: number;
  unitPrice: number;
  discount: number;
  soldAmount: number;
}

export interface SaleDTO {
  invoice: string;
  customerId: number;
  customerName: string;
  sellerName: string;
  saleDate: string;
  saleTime: string;
  receiveAmount: number;
  changeAmount: number;
  items: SaleItem[];
}

@Injectable({
  providedIn: 'root'
})
export class SalesService {
  private baseUrl = 'http://localhost:8080';

  constructor(private http: HttpClient) { }

  // 🔹 Create a new sale
  createSale(sale: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/sales`, sale);
  }

  // 🔹 Update an existing sale
  updateSale(sale: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/sales/update`, sale);
  }

  // 🔹 Cancel a sale by invoice
  cancelSale(invoice: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/sales/cancel`, { invoice });
  }

  // 🔹 Get sales by invoice (grouped DTO)
  getSalesByInvoice(invoice: string): Observable<SaleDTO> {
    return this.http.get<SaleDTO>(`${this.baseUrl}/sales/invoice/${invoice}`);
  }

  // 🔹 Get sales list with pagination + sorting
  getSalesList(params: HttpParams): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/sales/list`, { params });
  }

  getInvoiceList(params: HttpParams): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/sales/search`, { params });
  }

  // 🔹 Get sales by date
  getSalesByDate(date: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/sales/date/${date}`);
  }

  // 🔹 Get sales by date range
  getSalesByDateRange(start: string, end: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/sales/range?start=${start}&end=${end}`);
  }

  // 🔹 Search sales by keyword
  searchSales(keyword: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/sales/search`, {
      params: { keyword }
    });
  }

  // 🔹 Import sales from Excel
  importSales(): Observable<any> {
    return this.http.post(`${this.baseUrl}/sales/import`, {}, { responseType: 'text' });
  }

  // 🔹 Export sales to Excel
  exportSales(): Observable<any> {
    return this.http.get(`${this.baseUrl}/sales/export`, { responseType: 'text' });
  }

  exportIncomeForDate(date: string) {
    return this.http.post(`/sales/export-income/${date}`, null);
  }
}
