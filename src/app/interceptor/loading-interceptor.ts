import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Loader } from '../services/loader';
import { finalize } from 'rxjs';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const _loaderService = inject(Loader);

  _loaderService.loading.set(true);

  return next(req).pipe(
    finalize(() => {
      _loaderService.loading.set(false);
    })
  );
};
