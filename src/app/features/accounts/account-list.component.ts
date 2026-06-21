import { Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { AccountService } from '../../core/services/account.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { AccountResponse } from '../../core/models/account.dto';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../../shared/components/confirm-dialog.component';

/** Listagem de contas com acoes de visualizar, editar e excluir. */
@Component({
  selector: 'app-account-list',
  standalone: true,
  imports: [
    CurrencyPipe,
    RouterLink,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './account-list.component.html',
  styleUrl: './account-list.component.scss',
})
export class AccountListComponent {
  private readonly accountService = inject(AccountService);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly dialog = inject(MatDialog);

  readonly isAdmin = this.auth.isAdmin;

  /** O saldo das outras contas so e exibido para o ADMIN. */
  readonly displayedColumns = computed(() =>
    this.isAdmin()
      ? ['name', 'balance', 'id', 'actions']
      : ['name', 'id', 'actions'],
  );

  readonly accounts = signal<AccountResponse[]>([]);
  readonly loading = signal(true);

  readonly totalElements = signal(0);
  readonly pageIndex = signal(0);
  readonly pageSize = signal(10);

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.accountService.list(this.pageIndex(), this.pageSize()).subscribe({
      next: (page) => {
        this.accounts.set(page.content);
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

  /** True se a conta pertence ao usuario logado. */
  owns(id: string): boolean {
    return this.auth.ownsAccount(id);
  }

  confirmDelete(account: AccountResponse): void {
    const data: ConfirmDialogData = {
      title: 'Excluir conta',
      message: `Tem certeza que deseja excluir a conta de ${account.name}? Esta ação não pode ser desfeita.`,
      confirmText: 'Excluir',
    };
    this.dialog
      .open(ConfirmDialogComponent, { data, width: '420px' })
      .afterClosed()
      .subscribe((confirmed) => {
        if (confirmed) {
          this.delete(account.id);
        }
      });
  }

  private delete(id: string): void {
    this.accountService.delete(id).subscribe({
      next: () => {
        this.toast.success('Conta excluída com sucesso.');
        this.load();
      },
    });
  }
}
