import { Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AccountService } from '../../core/services/account.service';
import { TransferService } from '../../core/services/transfer.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { AccountResponse } from '../../core/models/account.dto';
import { TransferResponse } from '../../core/models/transfer.dto';

type Phase = 'form' | 'confirm' | 'done';

/**
 * Fluxo de transferencia em 3 fases na mesma tela:
 *  1. form    -> escolhe destino (lista) e valor
 *  2. confirm -> revisa os dados antes de efetivar
 *  3. done    -> resultado de sucesso com a notificacao gerada
 */
@Component({
  selector: 'app-transfer',
  standalone: true,
  imports: [
    CurrencyPipe,
    RouterLink,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './transfer.component.html',
  styleUrl: './transfer.component.scss',
})
export class TransferComponent {
  private readonly fb = inject(FormBuilder);
  private readonly accountService = inject(AccountService);
  private readonly transferService = inject(TransferService);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);

  readonly phase = signal<Phase>('form');
  readonly loading = signal(true);
  readonly submitting = signal(false);

  readonly sourceAccount = signal<AccountResponse | null>(null);
  readonly accounts = signal<AccountResponse[]>([]);
  readonly result = signal<TransferResponse | null>(null);

  /** Contas de destino possiveis: todas, exceto a do usuario logado. */
  readonly destinationOptions = computed(() => {
    const sourceId = this.auth.currentUser()?.accountId;
    return this.accounts().filter((a) => a.id !== sourceId);
  });

  readonly form = this.fb.nonNullable.group({
    destinationAccountId: ['', Validators.required],
    amount: [
      null as number | null,
      [Validators.required, Validators.min(0.01)],
    ],
  });

  constructor() {
    this.loadData();
  }

  private loadData(): void {
    const sourceId = this.auth.currentUser()?.accountId;
    if (!sourceId) {
      return;
    }
    this.loading.set(true);
    this.accountService.getById(sourceId).subscribe({
      next: (acc) => this.sourceAccount.set(acc),
    });
    this.accountService.list(0, 100).subscribe({
      next: (page) => {
        this.accounts.set(page.content);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  get selectedDestination(): AccountResponse | undefined {
    const id = this.form.controls.destinationAccountId.value;
    return this.accounts().find((a) => a.id === id);
  }

  goToConfirm(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.phase.set('confirm');
  }

  backToForm(): void {
    this.phase.set('form');
  }

  confirm(): void {
    const sourceId = this.auth.currentUser()?.accountId;
    const { destinationAccountId, amount } = this.form.getRawValue();
    if (!sourceId || !destinationAccountId || amount == null) {
      return;
    }
    this.submitting.set(true);
    this.transferService
      .transfer({ sourceAccountId: sourceId, destinationAccountId, amount })
      .subscribe({
        next: (res) => {
          this.result.set(res);
          this.submitting.set(false);
          this.phase.set('done');
          this.toast.success('Transferência concluída com sucesso!');
        },
        error: () => this.submitting.set(false),
      });
  }

  reset(): void {
    this.form.reset({ destinationAccountId: '', amount: null });
    this.result.set(null);
    this.phase.set('form');
    this.loadData();
  }
}
