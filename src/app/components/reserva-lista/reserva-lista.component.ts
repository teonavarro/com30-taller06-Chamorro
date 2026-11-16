import { Component, inject, input, signal, computed } from '@angular/core';
import { toSignal, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {
  of,
  map,
  tap,
  debounceTime,
  distinctUntilChanged,
  switchMap
} from 'rxjs';
import { ReservaService } from '../../services/reserva.service';
import { Reserva } from '../../models/reserva';

@Component({
  selector: 'app-reserva-lista',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, RouterLinkActive],
  template: `
    <h2>Lista de Reservas</h2>

    <div class="filtros">
      <a
        [routerLink]="[]"
        [queryParams]="{ estado: null }"
        [routerLinkActive]="'active'"
        [routerLinkActiveOptions]="{ exact: true }"
        >Todos</a
      >
      <a
        [routerLink]="[]"
        [queryParams]="{ estado: 'Pendiente' }"
        [routerLinkActive]="'active'"
        >Pendiente</a
      >
      <a
        [routerLink]="[]"
        [queryParams]="{ estado: 'Aprobada' }"
        [routerLinkActive]="'active'"
        >Aprobada</a
      >
      <a
        [routerLink]="[]"
        [queryParams]="{ estado: 'Rechazada' }"
        [routerLinkActive]="'active'"
        >Rechazada</a
      >
    </div>

    <input
      type="text"
      [formControl]="busquedaControl"
      placeholder="Buscar por responsable o espacio..."
    />

    @if (busquedaControl.value.length > 0 && busquedaControl.value.length < 2) {
      <p class="msg aviso">Ingrese al menos 2 caracteres para buscar.</p>
    } @else if (cargando()) {
      <p class="msg cargando">Buscando...</p>
    }

    <table>
      <thead>
        <tr>
          <th>Responsable</th>
          <th>Espacio</th>
          <th>Fecha</th>
          <th>Horario</th>
          <th>Asistentes</th>
          <th>Estado</th>
          <th>Detalle</th>
        </tr>
      </thead>
      <tbody>
        @if (busquedaControl.value.length >= 2 || busquedaControl.value.length === 0) {
          @for (reserva of reservasFiltradas(); track reserva.id) {
            <tr>
              <td>{{ reserva.responsable }}</td>
              <td>{{ reserva.espacio }}</td>
              <td>{{ reserva.fecha }}</td>
              <td>{{ reserva.horaInicio }} - {{ reserva.horaFin }}</td>
              <td>{{ reserva.asistentes }}</td>
              <td>{{ reserva.estado }}</td>
              <td>
                <a [routerLink]="['/reservas', reserva.id]">Ver detalle</a>
              </td>
            </tr>
          } @empty {
            <tr>
              <td colspan="7">Sin coincidencias</td>
            </tr>
          }
        }
      </tbody>
    </table>
  `
})
export class ReservaListaComponent {
  private reservaService = inject(ReservaService);
  servicio = this.reservaService;

  estado = input<string>();

  busquedaControl = new FormControl('', { nonNullable: true });
  cargando = signal<boolean>(false);

  private textoValido$ = this.busquedaControl.valueChanges.pipe(
    map((texto) => texto.trim()),
    distinctUntilChanged(),
    takeUntilDestroyed()
  );

  private resultado$ = this.textoValido$.pipe(
    tap((texto) => {
      if (texto.length < 2) this.cargando.set(false);
    }),
    debounceTime(300),
    switchMap((texto) => {
      if (texto.length < 2) {
        return of(this.reservaService.reservas());
      }
      this.cargando.set(true);
      return this.reservaService.buscar(texto).pipe(
        tap(() => this.cargando.set(false))
      );
    })
  );

  resultadosBusqueda = toSignal(this.resultado$, {
    initialValue: this.reservaService.reservas()
  });

  reservasFiltradas = computed(() => {
    const filtro = this.estado();
    const lista = this.resultadosBusqueda();
    if (!filtro || filtro === 'Todos') return lista;
    return lista.filter((r) => r.estado === filtro);
  });
}
