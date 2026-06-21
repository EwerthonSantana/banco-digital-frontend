/** DTOs de Transferencia, espelhando o contrato da API. */

/** Payload da transferencia (POST /transfers). */
export interface TransferRequest {
  sourceAccountId: string;
  destinationAccountId: string;
  amount: number;
}

/** Resposta da transferencia concluida. */
export interface TransferResponse {
  transferId: string;
  sourceAccountId: string;
  destinationAccountId: string;
  amount: number;
  sourceBalanceAfter: number;
  createdAt: string;
}
