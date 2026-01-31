import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface SaleReportDTO {
  reportDate: string;
  totalSalesAmount: number;
  totalUnitsSold: number;
  totalTransactions: number;
}

export interface MonthlySaleReportDTO {
  reportYear: number;
  reportMonth: number;
  totalSalesAmount: number;
  totalUnitsSold: number;
  totalTransactions: number;
  generatedAt: string;
  dailySummaries: SaleReportDTO[];
}

export interface YearlySaleReportDTO {
  reportYear: number;
  totalSalesAmount: number;
  totalUnitsSold: number;
  totalTransactions: number;
  generatedAt: string;
  monthlySummaries: MonthlySaleReportDTO[];
}

export interface ImportSummary {
  created: number;
  updated: number;
  errors: string[];
}

@Injectable({
  providedIn: 'root'
})
export class SaleReportService {
  private baseUrl = 'http://localhost:8080/';

  constructor(private http: HttpClient) { }

  /** 🔹 Daily Reports */
  getDailyReport(date: string): Observable<SaleReportDTO> {
    return this.http.get<SaleReportDTO>(`${this.baseUrl}sale_report/report/daily?date=${date}`);
  }

  saveDailyReport(report: SaleReportDTO): Observable<string> {
    return this.http.post(`${this.baseUrl}sale_report/report/daily`, report, { responseType: 'text' });
  }

  exportDailyReport(date: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}sale_report/export/daily?date=${date}`, { responseType: 'blob' });
  }

  importDailyReport(): Observable<ImportSummary> {
    return this.http.post<ImportSummary>(`${this.baseUrl}api/excel/sale-reports/import`, {});
  }

  /** 🔹 Monthly Reports */
  generateMonthlyReport(year: number, month: number): Observable<MonthlySaleReportDTO> {
    return this.http.get<MonthlySaleReportDTO>(
      `${this.baseUrl}sale_report/report/monthly?year=${year}&month=${month}`
    );
  }

  exportMonthlyReport(): Observable<string> {
    return this.http.get(`${this.baseUrl}api/excel/sale-reports/export/monthly`, { responseType: 'text' });
  }

  importMonthlyReport(): Observable<ImportSummary> {
    return this.http.post<ImportSummary>(`${this.baseUrl}api/excel/sale-reports/import/monthly`, {});
  }

  /** 🔹 Yearly Reports */
  generateYearlyReport(year: number): Observable<YearlySaleReportDTO> {
    return this.http.get<YearlySaleReportDTO>(`${this.baseUrl}sale_report/report/yearly?year=${year}`);
  }

  exportYearlyReport(): Observable<string> {
    return this.http.get(`${this.baseUrl}api/excel/sale-reports/export/yearly`, { responseType: 'text' });
  }

  importYearlyReport(): Observable<ImportSummary> {
    return this.http.post<ImportSummary>(`${this.baseUrl}sale_report/import/yearly`, {});
  }
}
