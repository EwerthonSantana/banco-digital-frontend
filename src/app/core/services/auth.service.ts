import { Injectable, computed, signal } from '@angular/core';
import { AuthUser, UserRole } from '../models/auth-user.model';

/** Uma conta semeada no banco (espelha o V2__seed_accounts.sql da API). */
interface SeedAccount {
  name: string;
  accountId: string;
  role: UserRole;
}

/**
 * Autenticacao MOCKADA (o backend ainda nao tem JWT).
 *
 * A lista abaixo espelha as contas criadas pela migration
 * V2__seed_accounts.sql. O login usa o NOME EXATO da conta como usuario
 * (sem diferenciar maiusculas/minusculas) e a senha fixa "123" para todos.
 *
 * O ADM possui papel de administrador E uma conta com saldo alto, para
 * permitir tanto as acoes administrativas quanto testes de transferencia.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private static readonly STORAGE_KEY = 'banco.auth.user';
  private static readonly DEFAULT_PASSWORD = '123';

  /** Contas semeadas (mesmos nomes/ids do banco). */
  readonly seedAccounts: SeedAccount[] = [
    { name: 'Maria Silva', accountId: '11111111-1111-1111-1111-111111111111', role: 'USER' },
    { name: 'Joao Souza', accountId: '22222222-2222-2222-2222-222222222222', role: 'USER' },
    { name: 'Ana Pereira', accountId: '33333333-3333-3333-3333-333333333333', role: 'USER' },
    { name: 'Carlos Lima', accountId: '44444444-4444-4444-4444-444444444444', role: 'USER' },
    { name: 'Beatriz Costa', accountId: '55555555-5555-5555-5555-555555555555', role: 'USER' },
    { name: 'Pedro Santos', accountId: '66666666-6666-6666-6666-666666666666', role: 'USER' },
    { name: 'Juliana Almeida', accountId: '77777777-7777-7777-7777-777777777777', role: 'USER' },
    { name: 'Rafael Oliveira', accountId: '88888888-8888-8888-8888-888888888888', role: 'USER' },
    { name: 'Fernanda Rocha', accountId: '99999999-9999-9999-9999-999999999999', role: 'USER' },
    { name: 'Lucas Martins', accountId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', role: 'USER' },
    { name: 'ADM', accountId: 'dddddddd-dddd-dddd-dddd-dddddddddddd', role: 'ADMIN' },
  ];

  private readonly _currentUser = signal<AuthUser | null>(this.restore());

  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => this._currentUser() !== null);
  readonly isAdmin = computed(() => this._currentUser()?.role === 'ADMIN');

  /**
   * Tenta autenticar pelo nome da conta (case-insensitive) e senha "123".
   * Retorna true em caso de sucesso.
   */
  login(username: string, password: string): boolean {
    if (password !== AuthService.DEFAULT_PASSWORD) {
      return false;
    }
    const target = username.trim().toLowerCase();
    const match = this.seedAccounts.find(
      (a) => a.name.toLowerCase() === target,
    );
    if (!match) {
      return false;
    }
    const user: AuthUser = {
      username: match.name,
      name: match.name,
      role: match.role,
      accountId: match.accountId,
    };
    this._currentUser.set(user);
    localStorage.setItem(AuthService.STORAGE_KEY, JSON.stringify(user));
    return true;
  }

  logout(): void {
    this._currentUser.set(null);
    localStorage.removeItem(AuthService.STORAGE_KEY);
  }

  /** True se a conta informada pertence ao usuario logado. */
  ownsAccount(accountId: string): boolean {
    return this._currentUser()?.accountId === accountId;
  }

  private restore(): AuthUser | null {
    const raw = localStorage.getItem(AuthService.STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  }
}
