import { Component } from '@angular/core';
import { ReservaFormComponent } from './components/reserva-form/reserva-form.component';
import { ReservaListaComponent } from './components/reserva-lista/reserva-lista.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ReservaFormComponent, ReservaListaComponent],
  template: `
    <div style="max-width: 1000px; margin: 0 auto; padding: 20px; font-family: system-ui, sans-serif;">
      <h1 style="text-align: center; color: #1e293b;">Gestión de Reserva de Espacios (E3)</h1>
      <app-reserva-form></app-reserva-form>
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #cbd5e1;" />
      <app-reserva-lista></app-reserva-lista>
    </div>
  `
})
export class AppComponent {}