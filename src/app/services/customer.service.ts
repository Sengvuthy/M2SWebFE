//customer.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

declare var google: any;

export interface CustomerDTO {
  id?: number;
  name: string;
  phones: string[];
  addresses: string[];
  isDefault?: boolean;
  telegramId?: number | null; // auto-filled by backend after binding
}

@Injectable({ providedIn: 'root' })
export class CustomerService {
  private baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) { }

  // Reverse geocode lat/lng → human-readable address
  private getAddressFromCoords(lat: number, lng: number): Promise<string> {
    return new Promise((resolve, reject) => {
      const geocoder = new google.maps.Geocoder();
      const latlng = { lat, lng };

      geocoder.geocode(
        { location: latlng },
        (results: google.maps.GeocoderResult[], status: google.maps.GeocoderStatus) => {
          if (status === google.maps.GeocoderStatus.OK && results[0]) {
            resolve(results[0].formatted_address);
          } else {
            reject('Geocoder failed: ' + status);
          }
        }
      );
    });
  }

  // Create customer directly
  createCustomer(customer: CustomerDTO): Observable<CustomerDTO> {
    return this.http.post<CustomerDTO>(`${this.baseUrl}/customers`, customer);
  }

  // Signup flow: attach location → save customer
  async signUpCustomer(name: string, phones: string[]): Promise<Observable<CustomerDTO>> {
    const savedLocation = localStorage.getItem('userLocation');
    let address = '';

    if (savedLocation) {
      const { lat, lng } = JSON.parse(savedLocation);
      try {
        address = await this.getAddressFromCoords(lat, lng);
      } catch (err) {
        console.error('Failed to geocode location', err);
      }
    }

    const customer: CustomerDTO = {
      name,
      phones,
      addresses: address ? [address] : [],
      isDefault: true
    };
    return this.createCustomer(customer);
  }

  // Search by Telegram ID
  findByTelegramId(telegramId: number): Observable<CustomerDTO> {
    return this.http.get<CustomerDTO>(`${this.baseUrl}/customers/search-by-telegram-id`, {
      params: { telegramId }
    });
  }

  // ✅ Bind Telegram by Phone (phone only)
  bindTelegramByPhone(phone: string): Observable<CustomerDTO> {
    return this.http.post<CustomerDTO>(
      `${this.baseUrl}/customers/bind-telegram-by-phone`,
      null,
      { params: { phone } }
    );
  }

  // Search by phone (first match)
  findByPhone(phone: string): Observable<CustomerDTO> {
    return this.http.get<CustomerDTO>(`${this.baseUrl}/customers/search-by-phone`, {
      params: { phone }
    });
  }

  getFormattedAddress(lat: number, lng: number) {
    const apiKey = 'YOUR_GOOGLE_API_KEY';
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;
    return this.http.get(url);
  }

  // Other CRUD methods
  getById(id: number): Observable<CustomerDTO> {
    return this.http.get<CustomerDTO>(`${this.baseUrl}/customers/${id}`);
  }

  updateCustomer(id: number, data: CustomerDTO): Observable<CustomerDTO> {
    return this.http.put<CustomerDTO>(`${this.baseUrl}/customers/${id}`, data);
  }

  deleteCustomer(id: number): Observable<string> {
    return this.http.delete(`${this.baseUrl}/customers/${id}`, { responseType: 'text' });
  }

  getCustomerList(params: any): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/customers/search`, { params });
  }

  importCustomers(): Observable<any> {
    return this.http.post(`${this.baseUrl}/excel/customers/import`, {}, { responseType: 'json' });
  }

  exportCustomers(): Observable<any> {
    return this.http.post(`${this.baseUrl}/excel/customers/export`, {}, { responseType: 'json' });
  }
}
