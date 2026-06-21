import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { accountAccessGuard } from './core/guards/account-access.guard';
import { customerGuard } from './core/guards/customer.guard';

/**
 * Rotas da aplicacao.
 * - /login fica fora do layout (sem toolbar).
 * - As demais rotas sao filhas do LayoutComponent (toolbar + conteudo) e
 *   protegidas pelo authGuard. Todas usam lazy loading (loadComponent).
 */
export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    loadComponent: () =>
      import('./shared/layout/layout.component').then((m) => m.LayoutComponent),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      {
        path: 'home',
        loadComponent: () =>
          import('./features/home/home.component').then((m) => m.HomeComponent),
      },
      {
        path: 'transfer',
        canActivate: [customerGuard],
        loadComponent: () =>
          import('./features/transfer/transfer.component').then(
            (m) => m.TransferComponent,
          ),
      },
      {
        path: 'statement',
        canActivate: [customerGuard],
        loadComponent: () =>
          import('./features/statement/statement.component').then(
            (m) => m.StatementComponent,
          ),
      },
      {
        path: 'accounts',
        loadComponent: () =>
          import('./features/accounts/account-list.component').then(
            (m) => m.AccountListComponent,
          ),
      },
      {
        // Criar conta: exclusivo do ADMIN.
        path: 'accounts/new',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./features/accounts/account-form.component').then(
            (m) => m.AccountFormComponent,
          ),
      },
      {
        // Editar conta: ADMIN ou o proprio dono.
        path: 'accounts/:id/edit',
        canActivate: [accountAccessGuard],
        loadComponent: () =>
          import('./features/accounts/account-form.component').then(
            (m) => m.AccountFormComponent,
          ),
      },
      {
        // Detalhe/saldo de uma conta: ADMIN ou o proprio dono.
        path: 'accounts/:id',
        canActivate: [accountAccessGuard],
        loadComponent: () =>
          import('./features/accounts/account-detail.component').then(
            (m) => m.AccountDetailComponent,
          ),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
