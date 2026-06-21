import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

/**
 * Protege o acesso a uma conta especifica (detalhe/saldo e edicao).
 *
 * Regra:
 *  - ADMIN pode acessar qualquer conta (ver saldo / editar).
 *  - USER comum so pode acessar a PROPRIA conta.
 *
 * Consultar o saldo de OUTRAS contas e exclusivo do ADMIN.
 */
export const accountAccessGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const toast = inject(ToastService);

  const targetId = route.paramMap.get('id') ?? '';

  if (auth.isAdmin() || auth.ownsAccount(targetId)) {
    return true;
  }

  toast.error('Você só pode acessar a sua própria conta.');
  return router.createUrlTree(['/accounts']);
};
