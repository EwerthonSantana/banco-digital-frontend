import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

/**
 * Libera rotas que exigem uma conta (transferencia e extrato).
 * Tanto clientes quanto o ADM possuem conta, entao todos com accountId passam.
 * Mantido como salvaguarda caso exista, no futuro, um perfil sem conta.
 */
export const customerGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const toast = inject(ToastService);

  if (auth.currentUser()?.accountId) {
    return true;
  }
  toast.error('Este usuário não possui conta para esta operação.');
  return router.createUrlTree(['/home']);
};
