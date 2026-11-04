import { Injectable, signal, computed } from '@angular/core';
import { Reserva } from '../models/reserva';

@Injectable({
  providedIn: 'root'
})
export class ReservaService {
  // Signal privada con las reservas en memoria
  #reservas = signal<Reserva[]>([]);

  // Señal de solo lectura expuesta al exterior
  reservas = this.#reservas.asReadonly();

  // Señales computadas
  totalReservas = computed(() => this.#reservas().length);
  pendientesReservas = computed(() =>
    this.#reservas().filter((r) => r.estado === 'Pendiente').length
  );

  /**
   * Agrega una nueva reserva (sin id ni estado; el servicio los asigna).
   * Usa update() y arreglos inmutables (sin push/splice).
   */
  agregarReserva(reserva: Omit<Reserva, 'id' | 'estado'>) {
    const nueva: Reserva = {
      ...reserva,
      id: Date.now(),
      estado: 'Pendiente'
    };
    this.#reservas.update((lista) => [...lista, nueva]);
  }

  /**
   * Cambia el estado de una reserva existente.
   * Usa update() y map (inmutable).
   */
  cambiarEstado(id: number, nuevoEstado: 'Pendiente' | 'Aprobada' | 'Rechazada') {
    this.#reservas.update((lista) =>
      lista.map((r) => (r.id === id ? { ...r, estado: nuevoEstado } : r))
    );
  }

  /**
   * Elimina una reserva por id.
   * Usa update() y filter (inmutable).
   */
  eliminarReserva(id: number) {
    this.#reservas.update((lista) => lista.filter((r) => r.id !== id));
  }
}
