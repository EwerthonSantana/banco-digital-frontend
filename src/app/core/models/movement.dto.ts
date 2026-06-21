/** DTO de Movimentacao (extrato), espelhando o contrato da API. */

export type MovementDirection = 'DEBIT' | 'CREDIT';

export interface MovementResponse {
  transferId: string;
  direction: MovementDirection;
  counterpartyAccountId: string;
  counterpartyName: string;
  amount: number;
  createdAt: string;
}
