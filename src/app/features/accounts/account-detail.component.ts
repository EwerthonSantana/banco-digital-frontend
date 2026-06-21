import { Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AccountService } from '../../core/services/account.service';
import { AuthService } from '../../core/services/auth.service';
import { AccountResponse } from '../../core/models/account.dto';

/** Detalhe de uma conta (inclui o saldo em destaque). */
@Component({
  selector: 'app-account-detail',
  standalone: true,
  imports: [
    CurrencyPipe,
    DatePipe,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './account-detail.component.html',
  styleUrl: './account-detail.component.scss',
})
export class AccountDetailComponent {
  private readonly accountService = inject(AccountService);
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);

  private readonly accountId = this.route.snapshot.paramMap.get('id')!;

  readonly account = signal<AccountResponse | null>(null);
  readonly loading = signal(true);

  /** Indica se a conta exibida e a do usuario logado. */
  readonly isOwnAccount = computed(
    () => this.account()?.id === this.auth.currentUser()?.accountId,
  );

  constructor() {
    this.accountService.getById(this.accountId).subscribe({
      next: (acc) => {
        this.account.set(acc);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
