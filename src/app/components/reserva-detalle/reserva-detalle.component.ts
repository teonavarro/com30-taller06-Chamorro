import { Component, inject, input, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ReservaService } from '../../services/reserva.service';
import { Reserva } from '../../models/reserva';

@Component({
  selector: 'app-reserva-detalle',
  standalone: true,
  imports: [RouterLink],
  template: `
    <h2>Detalle de Reserva</h2>
    @if (reserva(); as r) {
      <div class="detalle">
        <p><strong>ID:</strong> {{ r.id }}</p>
        <p><strong>Responsable:</strong> {{ r.responsable }}</p>
        <p><strong>Espacio:</strong> {{ r.espacio }}</p>
        <p><strong>Fecha:</strong> {{ r.fecha }}</p>
        <p>
          <strong>Horario:</strong> {{ r.horaInicio }} - {{ r.horaFin }}
        </p>
        <p><strong>Asistentes:</strong> {{ r.asistentes }}</p>
        <p><strong>Estado:</strong> {{ r.estado }}</p>
        <h3>Recursos</h3>
        <ul>
          @for (recurso of r.recursos; track recurso.id) {
            <li>{{ recurso.recurso }} × {{ recurso.cantidad }}</li>
          } @empty {
            <li>Sin recursos asignados</li>
          }
        </ul>
      </div>
    } @else {
      <p class="error">No existe la reserva solicitada</p>
    }
    <a [routerLink]="'/reservas'">Volver al listado</a>
  `
})
export class ReservaDetalleComponent {
  private reservaService = inject(ReservaService);
  id = input.required<string>();

  reserva = computed<Reserva | undefined>(() => {
    const idNum = Number(this.id());
    return this.reservaService.reservas().find((r) => r.id === idNum);
  });
}
