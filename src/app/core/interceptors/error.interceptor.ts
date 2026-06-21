import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';

/**
 * Interceptor global de erros HTTP.
 *
 * Traduz o corpo de erro padronizado da API (ApiError) em uma mensagem
 * amigavel e exibe um toast. Depois repassa o erro para quem chamou, caso
 * precise de tratamento especifico.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      toast.error(resolveMessage(error));
      return throwError(() => error);
    }),
  );
};

function resolveMessage(error: HttpErrorResponse): string {
  // Erro de rede / API fora do ar
  if (error.status === 0) {
    return 'Nao foi possivel conectar a API. Verifique se o backend esta no ar.';
  }
  // Corpo padronizado da API: { status, error, message, fieldErrors }
  const body = error.error;
  if (body?.fieldErrors?.length) {
    return body.fieldErrors
      .map((f: { field: string; message: string }) => `${f.field}: ${f.message}`)
      .join(' | ');
  }
  if (body?.message) {
    return body.message;
  }
  return `Erro inesperado (HTTP ${error.status}).`;
}
