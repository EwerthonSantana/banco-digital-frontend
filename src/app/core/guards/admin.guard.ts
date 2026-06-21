import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

/**
 * Libera a rota apenas para o ADMIN (ex.: criar novas contas).
 * Demais usuarios sao redirecionados com aviso.
 */
export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const toast = inject(ToastService);

  if (auth.isAdmin()) {
    return true;
  }
  toast.error('Acesso restrito ao administrador.');
  return router.createUrlTree(['/home']);
};
