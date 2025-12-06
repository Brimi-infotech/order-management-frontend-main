import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  const _authService = inject(Auth);
  const _router = inject(Router);

  if (!_authService.isLoggedIn() || !_authService.isAuthorized()) {
    _router.navigate(['/login']);
    return false;
  }

  const user = _authService.getUser();
  if (user && user.role === 'staff') {
    if (
      !state.url.startsWith('/oms/dashboard') &&
      !state.url.startsWith('/oms/customer-form')
    ) {
      _router.navigate(['/oms/customers']);
      return false;
    }
  }
  return true;
};
