//expense.service.ts
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ExpenseReportItem {
  productName: string;
  source: 'CREATION' | 'IMPORT' | 'OTHER';
  expenseUnit: number;
  expensePrice: number;
  expenseAmount?: number;
}

export interface ExpenseReportDTO {
  expenseId: string;
  supplierName: string;
  payerName: string;
  expenseDate: string;
  expenseTime: string;
  items: ExpenseReportItem[];
  totalAmount?: number;
  source?: string;
}

@Injectable({ providedIn: 'root' })
export class ExpenseReportService {
  private baseUrl = environment.apiBaseUrl + '/expense-reports';

  constructor(private http: HttpClient) { }

  // ✅ Create expense
  createExpense(expense: ExpenseReportDTO): Observable<ExpenseReportDTO> {
    return this.http.post<ExpenseReportDTO>(`${this.baseUrl}`, expense);
  }

  // ✅ Update expense
  updateExpense(expense: ExpenseReportDTO): Observable<ExpenseReportDTO> {
    return this.http.put<ExpenseReportDTO>(`${this.baseUrl}/update`, expense);
  }

  // ✅ Cancel expense
  cancelExpense(expenseId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/cancel/${expenseId}`, {});
  }

  // ✅ Get expense by ID
  getExpenseByExpenseId(expenseId: string): Observable<ExpenseReportDTO> {
    return this.http.get<ExpenseReportDTO>(`${this.baseUrl}/expenseId/${expenseId}`);
  }

  // ✅ Get expenses list
  getExpensesList(params: HttpParams): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/list`, { params });
  }

  // ✅ Get expense ID list
  getExpenseIdList(params: HttpParams): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/search`, { params });
  }

  // ✅ Get expenses by date
  getExpensesByDate(date: string): Observable<ExpenseReportDTO[]> {
    return this.http.get<ExpenseReportDTO[]>(`${this.baseUrl}/date/${date}`);
  }

  // ✅ Get expenses by date range
  getExpensesByDateRange(start: string, end: string): Observable<ExpenseReportDTO[]> {
    return this.http.get<ExpenseReportDTO[]>(`${this.baseUrl}/range?start=${start}&end=${end}`);
  }

  // ✅ Search expenses
  searchExpenses(keyword: string): Observable<ExpenseReportDTO[]> {
    return this.http.get<ExpenseReportDTO[]>(`${this.baseUrl}/search-by-keyword`, { params: { keyword } });
  }

  // ✅ Import expenses
  importExpenses(): Observable<any> {
    return this.http.post(`${this.baseUrl}/import`, {}, { responseType: 'text' });
  }

  // ✅ Export expenses
  exportExpenses(): Observable<any> {
    return this.http.get(`${this.baseUrl}/export`, { responseType: 'text' });
  }
}
