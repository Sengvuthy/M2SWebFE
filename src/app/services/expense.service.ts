//expense.service.ts
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

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
  private baseUrl = 'http://localhost:8080/expense-reports';

  constructor(private http: HttpClient) { }

  createExpense(expense: ExpenseReportDTO): Observable<ExpenseReportDTO> {
    return this.http.post<ExpenseReportDTO>(`${this.baseUrl}`, expense);
  }

  updateExpense(expense: ExpenseReportDTO): Observable<ExpenseReportDTO> {
    return this.http.put<ExpenseReportDTO>(`${this.baseUrl}/update`, expense);
  }

  cancelExpense(expenseId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/cancel/${expenseId}`, {});
  }

  getExpenseByExpenseId(expenseId: string): Observable<ExpenseReportDTO> {
    return this.http.get<ExpenseReportDTO>(`${this.baseUrl}/expenseId/${expenseId}`);
  }

  getExpensesList(params: HttpParams): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/list`, { params });
  }

  getExpenseIdList(params: HttpParams): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/search`, { params });
  }

  getExpensesByDate(date: string): Observable<ExpenseReportDTO[]> {
    return this.http.get<ExpenseReportDTO[]>(`${this.baseUrl}/date/${date}`);
  }

  getExpensesByDateRange(start: string, end: string): Observable<ExpenseReportDTO[]> {
    return this.http.get<ExpenseReportDTO[]>(`${this.baseUrl}/range?start=${start}&end=${end}`);
  }

  getExpenseReports(params: HttpParams): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/expense-reports`, { params });
  }

  searchExpenses(keyword: string): Observable<ExpenseReportDTO[]> {
    return this.http.get<ExpenseReportDTO[]>(`${this.baseUrl}/search-by-keyword`, { params: { keyword } });
  }

  importExpenses(): Observable<any> {
    return this.http.post(`${this.baseUrl}/import`, {}, { responseType: 'text' });
  }

  exportExpenses(): Observable<any> {
    return this.http.get(`${this.baseUrl}/export`, { responseType: 'text' });
  }
}
