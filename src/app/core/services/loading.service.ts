import { Injectable, computed, signal } from '@angular/core';

/**
 * Controla o estado de carregamento global da aplicacao.
 *
 * Usa um contador de requisicoes em andamento (e nao um simples boolean) para
 * suportar varias chamadas HTTP simultaneas: o spinner so some quando a ultima
 * requisicao termina.
 */
@Injectable({ providedIn: 'root' })
export class LoadingService {
  private readonly activeRequests = signal(0);

  /** True enquanto houver ao menos uma requisicao em andamento. */
  readonly isLoading = computed(() => this.activeRequests() > 0);

  show(): void {
    this.activeRequests.update((n) => n + 1);
  }

  hide(): void {
    this.activeRequests.update((n) => Math.max(0, n - 1));
  }
}
