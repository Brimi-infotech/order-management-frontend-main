
import { Observable } from 'rxjs';
import CONSTANTS from '../constants/constants';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ItemsS {
  private readonly _http = inject(HttpClient);

  addItem(data: any): Observable<any> {
    return this._http.post<any>(
      `${CONSTANTS.API_URL}${CONSTANTS.ENDPOINTS.ADD_ITEM}`,
      data
    );
  }

  getItems(): Observable<any> {
    return this._http.get<any>(
      `${CONSTANTS.API_URL}${CONSTANTS.ENDPOINTS.ITEMS}`
    );
  }

  deleteItem(itemId: string): Observable<any> {
    return this._http.delete<any>(
      `${CONSTANTS.API_URL}${CONSTANTS.ENDPOINTS.ITEMS}/${itemId}`
    );
  }

  getItemById(itemId: string): Observable<any> {
    return this._http.get<any>(
      `${CONSTANTS.API_URL}${CONSTANTS.ENDPOINTS.ITEMS}/${itemId}`
    );
  }

  editItem(itemId: string, data: any): Observable<any> {
    return this._http.put<any>(
      `${CONSTANTS.API_URL}${CONSTANTS.ENDPOINTS.ITEMS}/${itemId}`,
      data
    );
  }
}
