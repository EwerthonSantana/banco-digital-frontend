/** Papel do usuario no sistema. */
export type UserRole = 'ADMIN' | 'USER';

/**
 * Usuario autenticado (mock). Representa o cliente/admin "logado".
 *
 * - USER: cliente do banco, vinculado a uma conta (accountId preenchido).
 * - ADMIN: administrador do sistema, sem conta propria (accountId vazio).
 *
 * Nao e um DTO da API — e um modelo de sessao do front.
 */
export interface AuthUser {
  username: string;
  name: string;
  role: UserRole;
  /** Conta do cliente. Vazio para o ADMIN, que nao possui conta. */
  accountId: string;
}
