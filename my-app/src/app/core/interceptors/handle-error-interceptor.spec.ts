import { TestBed } from '@angular/core/testing';
import { HttpInterceptorFn } from '@angular/common/http';
import { throwError } from 'rxjs';

import { handleErrorInterceptor } from './handle-error-interceptor';

describe('handleErrorInterceptor', () => {
  const interceptor: HttpInterceptorFn = (req, next) => 
    TestBed.runInInjectionContext(() => handleErrorInterceptor(req, next));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(interceptor).toBeTruthy();
  });

  it('logs errors to console and rethrows the error', (done) => {
    const fakeReq = {} as any;
    const fakeError = { status: 500, message: 'Server error' };
    const next = (req: any) => throwError(() => fakeError);

    spyOn(console, 'error');

    interceptor(fakeReq, next).subscribe({
      next: () => fail('should not emit a next value'),
      error: (err) => {
        expect(console.error).toHaveBeenCalled();
        expect(err).toBe(fakeError);
        done();
      }
    });
  });
});
