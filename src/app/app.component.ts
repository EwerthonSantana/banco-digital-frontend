import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GlobalSpinnerComponent } from './shared/components/global-spinner.component';

/** Componente raiz: hospeda o roteador e o spinner global de carregamento. */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, GlobalSpinnerComponent],
  template: `
    <router-outlet />
    <app-global-spinner />
  `,
})
export class AppComponent {}
