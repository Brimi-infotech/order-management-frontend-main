import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import CONSTANTS from '../constants/constants';

@Injectable({
  providedIn: 'root'
})
export class StaffS {
  private readonly _http = inject(HttpClient);

  addStaff(data: any): Observable<any> {
    return this._http.post<any>(
      `${CONSTANTS.API_URL}${CONSTANTS.ENDPOINTS.ADD_STAFF}`,
      data
    );
  }

  getStaffs(): Observable<any> {
    return this._http.get<any>(
      `${CONSTANTS.API_URL}${CONSTANTS.ENDPOINTS.STAFF}`
    );
  }

  deleteStaff(staffId: string): Observable<any> {
    return this._http.delete<any>(
      `${CONSTANTS.API_URL}${CONSTANTS.ENDPOINTS.STAFF}/${staffId}`
    );
  }

  getStaffById(staffId: string): Observable<any> {
    return this._http.get<any>(
      `${CONSTANTS.API_URL}${CONSTANTS.ENDPOINTS.STAFF}/${staffId}`
    );
  }

  editStaff(staffId: string, data: any): Observable<any> {
    return this._http.put<any>(
      `${CONSTANTS.API_URL}${CONSTANTS.ENDPOINTS.STAFF}/${staffId}`,
      data
    );
  }
}
