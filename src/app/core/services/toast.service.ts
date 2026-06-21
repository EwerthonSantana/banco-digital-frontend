import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

/**
 * Feedback visual ao usuario via snackbar do Material.
 * Centraliza mensagens de sucesso e erro em um unico lugar.
 */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly snackBar = inject(MatSnackBar);

  success(message: string): void {
    this.snackBar.open(message, 'OK', {
      duration: 4000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: 'toast-success',
    });
  }

  error(message: string): void {
    this.snackBar.open(message, 'Fechar', {
      duration: 6000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: 'toast-error',
    });
  }
}
