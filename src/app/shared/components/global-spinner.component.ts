import { Component, inject } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LoadingService } from '../../core/services/loading.service';

/**
 * Overlay de carregamento global. Fica sempre montado (no AppComponent) e se
 * mostra/esconde reagindo ao LoadingService. Bloqueia interacoes durante a
 * requisicao, evitando cliques duplos.
 */
@Component({
  selector: 'app-global-spinner',
  standalone: true,
  imports: [MatProgressSpinnerModule],
  template: `
    @if (loading.isLoading()) {
      <div class="loading-overlay">
        <div class="loading-box">
          <mat-spinner diameter="56" strokeWidth="5"></mat-spinner>
          <span>Carregando...</span>
        </div>
      </div>
    }
  `,
  styles: [
    `
      .loading-overlay {
        position: fixed;
        inset: 0;
        z-index: 2000;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(15, 23, 42, 0.35);
        backdrop-filter: blur(2px);
        animation: fade-in 0.12s ease;
      }

      .loading-box {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;
        padding: 28px 36px;
        background: #fff;
        border-radius: 16px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.18);
      }

      .loading-box span {
        font-size: 0.9rem;
        font-weight: 500;
        color: #41506b;
      }

      @keyframes fade-in {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }
    `,
  ],
})
export class GlobalSpinnerComponent {
  readonly loading = inject(LoadingService);
}
