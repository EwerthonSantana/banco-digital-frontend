import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TransferService } from '../../core/services/transfer.service';
import { AuthService } from '../../core/services/auth.service';
import { MovementResponse } from '../../core/models/movement.dto';

/**
 * Extrato bancario: lista paginada das movimentacoes da conta logada.
 * Cada linha mostra a direcao (DEBIT/CREDIT) sob a otica da conta.
 */
@Component({
  selector: 'app-statement',
  standalone: true,
  imports: [
    CurrencyPipe,
    DatePipe,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './statement.component.html',
  styleUrl: './statement.component.scss',
})
export class StatementComponent {
  private readonly transferService = inject(TransferService);
  private readonly auth = inject(AuthService);

  readonly displayedColumns = ['createdAt', 'direction', 'counterparty', 'amount'];
  readonly movements = signal<MovementResponse[]>([]);
  readonly loading = signal(true);

  readonly totalElements = signal(0);
  readonly pageIndex = signal(0);
  readonly pageSize = signal(10);

  constructor() {
    this.load();
  }

  load(): void {
    const accountId = this.auth.currentUser()?.accountId;
    if (!accountId) {
      return;
    }
    this.loading.set(true);
    this.transferService
      .getMovements(accountId, this.pageIndex(), this.pageSize())
      .subscribe({
        next: (page) => {
          this.movements.set(page.content);
          this.totalElements.set(page.totalElements);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  onPage(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.load();
  }
}
