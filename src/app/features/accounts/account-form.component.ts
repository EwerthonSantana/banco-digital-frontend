import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AccountService } from '../../core/services/account.service';
import { ToastService } from '../../core/services/toast.service';

/**
 * Formulario de conta usado para CRIAR e EDITAR.
 * - Criar: nome + saldo inicial.
 * - Editar: apenas o nome (o saldo so muda por transferencia, regra do backend).
 */
@Component({
  selector: 'app-account-form',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './account-form.component.html',
  styleUrl: './account-form.component.scss',
})
export class AccountFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly accountService = inject(AccountService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  private readonly accountId = this.route.snapshot.paramMap.get('id');

  readonly isEdit = signal(this.accountId !== null);
  readonly saving = signal(false);

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(150)]],
    initialBalance: [
      0 as number,
      [Validators.required, Validators.min(0)],
    ],
  });

  constructor() {
    if (this.accountId) {
      this.accountService.getById(this.accountId).subscribe({
        next: (acc) => {
          this.form.patchValue({ name: acc.name, initialBalance: acc.balance });
          this.form.controls.initialBalance.disable();
        },
      });
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    const { name, initialBalance } = this.form.getRawValue();

    const request$ = this.accountId
      ? this.accountService.update(this.accountId, { name })
      : this.accountService.create({ name, initialBalance });

    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.toast.success(
          this.accountId ? 'Conta atualizada.' : 'Conta criada com sucesso.',
        );
        this.router.navigate(['/accounts']);
      },
      error: () => this.saving.set(false),
    });
  }
}
