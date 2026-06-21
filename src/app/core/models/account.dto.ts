/**
 * DTOs de Conta. Espelham exatamente o contrato da Banco Digital API,
 * mantendo a camada de transporte separada da view.
 */

/** Resposta da API para uma conta. */
export interface AccountResponse {
  id: string;
  name: string;
  balance: number;
  createdAt: string;
  updatedAt: string;
}

/** Payload para criacao de conta (POST /accounts). */
export interface CreateAccountRequest {
  name: string;
  initialBalance: number;
}

/** Payload para atualizacao cadastral (PUT /accounts/{id}). */
export interface UpdateAccountRequest {
  name: string;
}
