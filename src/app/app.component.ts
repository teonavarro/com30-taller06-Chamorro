import { Component } from '@angular/core';
import { ReservaFormComponent } from './components/reserva-form/reserva-form.component';
import { ReservaListaComponent } from './components/reserva-lista/reserva-lista.component';
import { BusquedaReservaComponent } from './components/busqueda-reserva/busqueda-reserva.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ReservaFormComponent, ReservaListaComponent, BusquedaReservaComponent],
  template: `
    <div style="max-width: 1000px; margin: 0 auto; padding: 20px; font-family: system-ui, sans-serif;">
      <h1 style="text-align: center; color: #1e293b;">Gestión de Reserva de Espacios (E3)</h1>

      <section style="margin-bottom: 40px;">
        <h2 style="border-bottom: 2px solid #1e293b; padding-bottom: 8px;">Búsqueda Reactiva</h2>
        <app-busqueda-reserva></app-busqueda-reserva>
      </section>

      <hr style="margin: 40px 0; border: none; border-top: 1px solid #cbd5e1;" />

      <section>
        <h2 style="border-bottom: 2px solid #1e293b; padding-bottom: 8px;">Nueva Reserva</h2>
        <app-reserva-form></app-reserva-form>
      </section>

      <hr style="margin: 40px 0; border: none; border-top: 1px solid #cbd5e1;" />

      <section>
        <h2 style="border-bottom: 2px solid #1e293b; padding-bottom: 8px;">Lista de Reservas</h2>
        <app-reserva-lista></app-reserva-lista>
      </section>
    </div>
  `
})
export class AppComponent {}
