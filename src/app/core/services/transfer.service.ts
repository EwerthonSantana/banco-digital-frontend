import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MovementResponse } from '../models/movement.dto';
import { Page } from '../models/page.dto';
import { TransferRequest, TransferResponse } from '../models/transfer.dto';

/**
 * Camada de acesso aos endpoints de Transferencia e Extrato.
 */
@Injectable({ providedIn: 'root' })
export class TransferService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  /**
   * Realiza uma transferencia. Gera e envia uma Idempotency-Key unica para
   * proteger contra envio duplicado (ex.: clique duplo / retry de rede).
   */
  transfer(payload: TransferRequest): Observable<TransferResponse> {
    const headers = new HttpHeaders().set(
      'Idempotency-Key',
      crypto.randomUUID(),
    );
    return this.http.post<TransferResponse>(
      `${this.baseUrl}/transfers`,
      payload,
      { headers },
    );
  }

  /** Extrato (movimentacoes) de uma conta. */
  getMovements(
    accountId: string,
    page = 0,
    size = 20,
  ): Observable<Page<MovementResponse>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Page<MovementResponse>>(
      `${this.baseUrl}/accounts/${accountId}/movements`,
      { params },
    );
  }
}
