import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ReservaService } from '../../services/reserva.service';

@Component({
  selector: 'app-estadisticas',
  standalone: true,
  imports: [RouterLink],
  template: `
    <h2>Estadísticas</h2>
    <div class="resumen">
      <p><strong>Total de reservas:</strong> {{ servicio.totalReservas() }}</p>
      <p><strong>Pendientes:</strong> {{ servicio.pendientesReservas() }}</p>
      <p>
        <strong>Aprobadas:</strong>
        {{ servicio.reservas().filter((r) => r.estado === 'Aprobada').length }}
      </p>
      <p>
        <strong>Rechazadas:</strong>
        {{ servicio.reservas().filter((r) => r.estado === 'Rechazada').length }}
      </p>
    </div>
    <a [routerLink]="'/reservas'">Volver al listado</a>
  `
})
export class EstadisticasComponent {
  servicio = inject(ReservaService);
}
