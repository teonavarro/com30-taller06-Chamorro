import { Component, inject, signal, computed } from '@angular/core';
import { toSignal, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  of,
  map,
  tap,
  debounceTime,
  distinctUntilChanged,
  switchMap,
  filter
} from 'rxjs';
import { ReservaService } from '../../services/reserva.service';
import { Reserva } from '../../models/reserva';

@Component({
  selector: 'app-busqueda-reserva',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <h2>Búsqueda Reactiva de Reservas</h2>

    <div class="busqueda-container">
      <input
        type="text"
        [formControl]="busquedaControl"
        placeholder="Buscar por responsable o espacio..."
      />

      <select (change)="onFiltroEstadoChange($event)">
        <option value="Todos">Todos</option>
        <option value="Pendiente">Pendiente</option>
        <option value="Aprobada">Aprobada</option>
        <option value="Rechazada">Rechazada</option>
      </select>
    </div>

    <!-- Mensajes de estado -->
    @if (busquedaControl.value.length > 0 && busquedaControl.value.length < 2) {
      <p class="msg aviso">Ingrese al menos 2 caracteres para buscar.</p>
    } @else if (cargando()) {
      <p class="msg cargando">Buscando...</p>
    }

    <!-- Resumen de resultados visibles -->
    <div class="resumen">
      <strong>Resumen:</strong>
      <span>Total: {{ resumen().total }}</span>
      <span>Pendientes: {{ resumen().pendientes }}</span>
      <span>Aprobadas: {{ resumen().aprobadas }}</span>
      <span>Rechazadas: {{ resumen().rechazadas }}</span>
    </div>

    <!-- Tabla de resultados filtrados -->
    <table>
      <thead>
        <tr>
          <th>Responsable</th>
          <th>Espacio</th>
          <th>Fecha</th>
          <th>Horario</th>
          <th>Asistentes</th>
          <th>Estado</th>
        </tr>
      </thead>
      <tbody>
        @if (busquedaControl.value.length >= 2 && !cargando()) {
          @for (reserva of reservasFiltradas(); track reserva.id) {
            <tr>
              <td>{{ reserva.responsable }}</td>
              <td>{{ reserva.espacio }}</td>
              <td>{{ reserva.fecha }}</td>
              <td>{{ reserva.horaInicio }} - {{ reserva.horaFin }}</td>
              <td>{{ reserva.asistentes }}</td>
              <td>{{ reserva.estado }}</td>
            </tr>
          } @empty {
            <tr>
              <td colspan="6">Sin coincidencias</td>
            </tr>
          }
        }
      </tbody>
    </table>

    <!-- Panel de historial y contador de llamadas -->
    <div class="panel-historial">
      <h3>Historial (últimas 5 búsquedas)</h3>
      @for (termino of historialBusquedas; track $index) {
        <span class="chip">{{ termino }}</span>
      } @empty {
        <span class="chip vacio">Sin búsquedas recientes</span>
      }
      <p class="llamadas">Llamadas al servicio: {{ servicio.llamadas() }}</p>
    </div>
  `
})
export class BusquedaReservaComponent {
  private reservaService = inject(ReservaService);
  servicio = this.reservaService; // expuesto para usarlo en el template

  // Control de búsqueda no nulo
  busquedaControl = new FormControl('', { nonNullable: true });

  // Estados de UI
  cargando = signal<boolean>(false);
  filtroEstado = signal<string>('Todos');

  // Flujo de texto de búsqueda (trim + distinct)
  private textoValido$ = this.busquedaControl.valueChanges.pipe(
    map((texto) => texto.trim()),
    distinctUntilChanged(),
    takeUntilDestroyed()
  );

  // Pipeline RxJS de búsqueda con debounce y switchMap
  private resultado$ = this.textoValido$.pipe(
    tap((texto) => {
      if (texto.length < 2) this.cargando.set(false);
    }),
    debounceTime(300),
    switchMap((texto) => {
      if (texto.length < 2) return of([]);
      this.cargando.set(true);
      return this.reservaService.buscar(texto).pipe(
        tap(() => this.cargando.set(false))
      );
    })
  );

  // Conversión a Signal
  resultadosBusqueda = toSignal(this.resultado$, {
    initialValue: [] as Reserva[]
  });

  // Filtro de estado sobre los resultados (sin volver al servicio)
  reservasFiltradas = computed(() => {
    const filtro = this.filtroEstado();
    const lista = this.resultadosBusqueda();
    if (filtro === 'Todos') return lista;
    return lista.filter((r) => r.estado === filtro);
  });

  // Resumen desglozado por estado
  resumen = computed(() => {
    const lista = this.reservasFiltradas();
    return {
      total: lista.length,
      pendientes: lista.filter((r) => r.estado === 'Pendiente').length,
      aprobadas: lista.filter((r) => r.estado === 'Aprobada').length,
      rechazadas: lista.filter((r) => r.estado === 'Rechazada').length
    };
  });

  // Historial de últimas 5 búsquedas válidas
  private historial = signal<string[]>([]);

  constructor() {
    this.textoValido$
      .pipe(
        filter((texto) => texto.length >= 2),
        takeUntilDestroyed()
      )
      .subscribe((texto) => {
        this.historial.update((h) =>
          [texto, ...h.filter((t) => t !== texto)].slice(0, 5)
        );
      });
  }

  /** Expone el historial para el template */
  get historialBusquedas(): string[] {
    return this.historial();
  }

  onFiltroEstadoChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.filtroEstado.set(select.value);
  }
}
