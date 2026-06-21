import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AccountService } from '../../core/services/account.service';
import { AuthService } from '../../core/services/auth.service';
import { AccountResponse } from '../../core/models/account.dto';

/**
 * Home / dashboard: mostra o saldo atual da conta logada e atalhos para as
 * principais acoes (transferir, extrato, gestao de contas).
 */
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CurrencyPipe,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  private readonly accountService = inject(AccountService);
  private readonly auth = inject(AuthService);

  readonly user = this.auth.currentUser;
  readonly isAdmin = this.auth.isAdmin;
  readonly account = signal<AccountResponse | null>(null);
  readonly loading = signal(true);
  readonly showBalance = signal(true);

  constructor() {
    this.loadAccount();
  }

  loadAccount(): void {
    const id = this.user()?.accountId;
    if (!id) {
      this.loading.set(false);
      return;
    }
    this.loading.set(true);
    this.accountService.getById(id).subscribe({
      next: (acc) => {
        this.account.set(acc);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  toggleBalance(): void {
    this.showBalance.update((v) => !v);
  }
}
