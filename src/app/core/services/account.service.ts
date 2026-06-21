import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AccountResponse,
  CreateAccountRequest,
  UpdateAccountRequest,
} from '../models/account.dto';
import { Page } from '../models/page.dto';

/**
 * Camada de acesso aos endpoints de Conta.
 * Toda comunicacao HTTP com /accounts fica concentrada aqui.
 */
@Injectable({ providedIn: 'root' })
export class AccountService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/accounts`;

  list(page = 0, size = 20): Observable<Page<AccountResponse>> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sort', 'createdAt');
    return this.http.get<Page<AccountResponse>>(this.baseUrl, { params });
  }

  getById(id: string): Observable<AccountResponse> {
    return this.http.get<AccountResponse>(`${this.baseUrl}/${id}`);
  }

  create(payload: CreateAccountRequest): Observable<AccountResponse> {
    return this.http.post<AccountResponse>(this.baseUrl, payload);
  }

  update(id: string, payload: UpdateAccountRequest): Observable<AccountResponse> {
    return this.http.put<AccountResponse>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
