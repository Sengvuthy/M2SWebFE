//exchange-rate.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ExchangeRateDTO {
  id: number;
  rate: number;
}

@Injectable({ providedIn: 'root' })
export class ExchangeRateService {
  private apiUrl = '/api/exchange-rate';

  constructor(private http: HttpClient) {}

  getRate(): Observable<ExchangeRateDTO> {
    return this.http.get<ExchangeRateDTO>(this.apiUrl);
  }

  setRate(newRate: number): Observable<ExchangeRateDTO> {
    return this.http.post<ExchangeRateDTO>(this.apiUrl, { rate: newRate });
  }

  toUSD(khr: number, rate: number): number {
    return khr / rate;
  }

  toKHR(usd: number, rate: number): number {
    return usd * rate;
  }
}
