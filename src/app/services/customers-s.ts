import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import CONSTANTS from '../constants/constants';

@Injectable({
  providedIn: 'root',
})
export class CustomersS {
  private readonly _http = inject(HttpClient);

  addCustomer(data: any): Observable<any> {
    return this._http.post<any>(`${CONSTANTS.API_URL}${CONSTANTS.ENDPOINTS.CUSTOMERS}`, data);
  }

  getCustomers(): Observable<any> {
    return this._http.get<any>(
      `${CONSTANTS.API_URL}${CONSTANTS.ENDPOINTS.CUSTOMERS}`
    );
  }

  deleteCustomer(customerId: string): Observable<any> {
    return this._http.delete<any>(
      `${CONSTANTS.API_URL}${CONSTANTS.ENDPOINTS.CUSTOMERS}/${customerId}`
    );
  }

  getCustomerById(customerId: string): Observable<any> {
    return this._http.get<any>(
      `${CONSTANTS.API_URL}${CONSTANTS.ENDPOINTS.CUSTOMERS}/${customerId}`
    );
  }

  editCustomer(customerId: string, data: any): Observable<any> {
    return this._http.put<any>(
      `${CONSTANTS.API_URL}${CONSTANTS.ENDPOINTS.CUSTOMERS}/${customerId}`,
      data
    );
  }
}
