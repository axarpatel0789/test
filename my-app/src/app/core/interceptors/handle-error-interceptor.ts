import { HttpInterceptorFn } from '@angular/common/http';

export const handleErrorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req);
};
