import { Component, inject } from '@angular/core';
import { ReservaService } from '../../services/reserva.service';

type EstadoReserva = 'Pendiente' | 'Aprobada' | 'Rechazada';

@Component({
  selector: 'app-reserva-lista',
  standalone: true,
  imports: [],
  template: `
    <h2>Lista de Reservas</h2>

    <table>
      <thead>
        <tr>
          <th>Responsable</th>
          <th>Espacio</th>
          <th>Fecha</th>
          <th>Horario</th>
          <th>Asistentes</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        @for (reserva of servicio.reservas(); track reserva.id) {
          <tr>
            <td>{{ reserva.responsable }}</td>
            <td>{{ reserva.espacio }}</td>
            <td>{{ reserva.fecha }}</td>
            <td>{{ reserva.horaInicio }} - {{ reserva.horaFin }}</td>
            <td>{{ reserva.asistentes }}</td>
            <td>
              <select (change)="onEstadoChange(reserva.id, $event)">
                @for (e of estados; track e) {
                  <option [value]="e" [selected]="reserva.estado === e">{{ e }}</option>
                }
              </select>
            </td>
            <td>
              <button type="button" (click)="eliminarReserva(reserva.id)">Eliminar</button>
            </td>
          </tr>
        } @empty {
          <tr>
            <td colspan="7">No hay registros de reservas.</td>
          </tr>
        }
      </tbody>
    </table>

    <!-- Panel de resumen / estadísticas diferido (carga por interacción) -->
    @defer (on interaction) {
      <div class="panel-estadisticas">
        <h3>Resumen / Estadísticas</h3>
        <p>Total de reservas: {{ servicio.totalReservas() }}</p>
        <p>Pendientes: {{ servicio.pendientesReservas() }}</p>
        <p>Aprobadas: {{ servicio.reservas().filter((r) => r.estado === 'Aprobada').length }}</p>
        <p>Rechazadas: {{ servicio.reservas().filter((r) => r.estado === 'Rechazada').length }}</p>
      </div>
    } @placeholder {
      <button type="button">Mostrar estadísticas</button>
    }
  `
})
export class ReservaListaComponent {
  servicio = inject(ReservaService);
  estados: EstadoReserva[] = ['Pendiente', 'Aprobada', 'Rechazada'];

  cambiarEstado(id: number, nuevoEstado: string) {
    this.servicio.cambiarEstado(id, nuevoEstado as EstadoReserva);
  }

  onEstadoChange(id: number, event: Event) {
    const select = event.target as HTMLSelectElement;
    this.cambiarEstado(id, select.value);
  }

  eliminarReserva(id: number) {
    this.servicio.eliminarReserva(id);
  }
}
