import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import CONSTANTS from '../constants/constants';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class Auth {
  private readonly _http = inject(HttpClient);
  private readonly _router = inject(Router);

  login(data: { username: string; password: string }): Observable<any> {
    return this._http.post<any>(
      `${CONSTANTS.API_URL}${CONSTANTS.ENDPOINTS.LOGIN}`,
      data
    );
  }

  isLoggedIn(): boolean {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    return isLoggedIn === 'true' ? true : false;
  }

  isAuthorized(): boolean {
    const token = sessionStorage.getItem('token');
    return token ? true : false;
  }

  logout(): void {
    localStorage.clear();
    sessionStorage.clear();
    this._router.navigate(['/login']);
  }

  getUser(): any {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
}
