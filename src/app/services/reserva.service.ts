import { Injectable, signal, computed } from '@angular/core';
import { Observable } from 'rxjs';
import { of, delay } from 'rxjs';
import { Reserva } from '../models/reserva';

/**
 * Semilla inicial fija de 12 reservas de espacios.
 * Estados repartidos: 4 Pendiente, 4 Aprobada, 4 Rechazada.
 */
const SEMILLA_INICIAL: Reserva[] = [
  {
    id: 1,
    responsable: 'Ana García',
    espacio: 'Sala de Juntas A',
    fecha: '2026-11-05',
    horaInicio: '09:00',
    horaFin: '10:00',
    asistentes: 6,
    recursos: [
      { id: 1, recurso: 'Proyector', cantidad: 1 },
      { id: 2, recurso: 'Pizarra', cantidad: 1 }
    ],
    estado: 'Pendiente'
  },
  {
    id: 2,
    responsable: 'Carlos Ruiz',
    espacio: 'Auditorio Principal',
    fecha: '2026-11-05',
    horaInicio: '14:00',
    horaFin: '16:00',
    asistentes: 40,
    recursos: [
      { id: 1, recurso: 'Micrófono', cantidad: 2 },
      { id: 2, recurso: 'Pantalla', cantidad: 1 }
    ],
    estado: 'Aprobada'
  },
  {
    id: 3,
    responsable: 'Beatriz López',
    espacio: 'Sala de Capacitación',
    fecha: '2026-11-06',
    horaInicio: '10:00',
    horaFin: '12:00',
    asistentes: 15,
    recursos: [
      { id: 1, recurso: 'Proyector', cantidad: 1 },
      { id: 2, recurso: 'Laptops', cantidad: 15 }
    ],
    estado: 'Rechazada'
  },
  {
    id: 4,
    responsable: 'Daniel Martínez',
    espacio: 'Sala de Juntas B',
    fecha: '2026-11-06',
    horaInicio: '15:00',
    horaFin: '15:30',
    asistentes: 4,
    recursos: [{ id: 1, recurso: 'Pizarra', cantidad: 1 }],
    estado: 'Pendiente'
  },
  {
    id: 5,
    responsable: 'Elena Fernández',
    espacio: 'Auditorio Principal',
    fecha: '2026-11-07',
    horaInicio: '09:00',
    horaFin: '11:00',
    asistentes: 50,
    recursos: [
      { id: 1, recurso: 'Micrófono', cantidad: 3 },
      { id: 2, recurso: 'Pantalla', cantidad: 1 },
      { id: 3, recurso: 'Sonido', cantidad: 1 }
    ],
    estado: 'Aprobada'
  },
  {
    id: 6,
    responsable: 'Fernando Gómez',
    espacio: 'Sala de Juntas A',
    fecha: '2026-11-07',
    horaInicio: '11:30',
    horaFin: '12:30',
    asistentes: 8,
    recursos: [
      { id: 1, recurso: 'Proyector', cantidad: 1 },
      { id: 2, recurso: 'Videoconferencia', cantidad: 1 }
    ],
    estado: 'Pendiente'
  },
  {
    id: 7,
    responsable: 'Gabriela Díaz',
    espacio: 'Sala de Capacitación',
    fecha: '2026-11-08',
    horaInicio: '08:00',
    horaFin: '10:00',
    asistentes: 20,
    recursos: [{ id: 1, recurso: 'Laptops', cantidad: 20 }],
    estado: 'Rechazada'
  },
  {
    id: 8,
    responsable: 'Héctor Sánchez',
    espacio: 'Sala de Juntas B',
    fecha: '2026-11-08',
    horaInicio: '10:30',
    horaFin: '11:30',
    asistentes: 5,
    recursos: [{ id: 1, recurso: 'Pizarra', cantidad: 1 }],
    estado: 'Aprobada'
  },
  {
    id: 9,
    responsable: 'Irene Morales',
    espacio: 'Auditorio Principal',
    fecha: '2026-11-09',
    horaInicio: '13:00',
    horaFin: '15:00',
    asistentes: 30,
    recursos: [
      { id: 1, recurso: 'Micrófono', cantidad: 2 },
      { id: 2, recurso: 'Pantalla', cantidad: 1 }
    ],
    estado: 'Pendiente'
  },
  {
    id: 10,
    responsable: 'Javier Castro',
    espacio: 'Sala de Capacitación',
    fecha: '2026-11-09',
    horaInicio: '15:30',
    horaFin: '17:00',
    asistentes: 12,
    recursos: [{ id: 1, recurso: 'Proyector', cantidad: 1 }],
    estado: 'Aprobada'
  },
  {
    id: 11,
    responsable: 'Karen Núñez',
    espacio: 'Sala de Juntas A',
    fecha: '2026-11-10',
    horaInicio: '09:00',
    horaFin: '09:45',
    asistentes: 3,
    recursos: [],
    estado: 'Rechazada'
  },
  {
    id: 12,
    responsable: 'Luis Ortega',
    espacio: 'Sala de Juntas B',
    fecha: '2026-11-10',
    horaInicio: '11:00',
    horaFin: '12:00',
    asistentes: 7,
    recursos: [
      { id: 1, recurso: 'Pizarra', cantidad: 1 },
      { id: 2, recurso: 'Videoconferencia', cantidad: 1 }
    ],
    estado: 'Pendiente'
  }
];

@Injectable({
  providedIn: 'root'
})
export class ReservaService {
  // Signal privada con las reservas en memoria (semilla inicial)
  #reservas = signal<Reserva[]>(SEMILLA_INICIAL);

  // Señal de solo lectura expuesta al exterior
  reservas = this.#reservas.asReadonly();

  // Contador de llamadas simuladas a la búsqueda
  #llamadas = signal<number>(0);
  llamadas = this.#llamadas.asReadonly();

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

  /**
   * Busca reservas por texto sobre los campos responsable y espacio.
   * Simula una llamada asíncrona con retardo dinámico.
   */
  buscar(texto: string): Observable<Reserva[]> {
    // Incrementar contador de llamadas
    this.#llamadas.update((n) => n + 1);

    // Normalizar texto: minúsculas y sin tildes
    const normalizado = this.normalizar(texto);

    // Filtrar coincidencias sobre responsable y espacio
    const resultados = this.#reservas().filter((r) => {
      const responsableNorm = this.normalizar(r.responsable);
      const espacioNorm = this.normalizar(r.espacio);
      return (
        responsableNorm.includes(normalizado) ||
        espacioNorm.includes(normalizado)
      );
    });

    // Retardo dinámico simulado
    const ms = Math.max(150, 1500 - 300 * texto.length);

    return of(resultados).pipe(delay(ms));
  }

  /**
   * Normaliza una cadena: minúsculas y sin tildes/diacríticos.
   */
  private normalizar(valor: string): string {
    return valor
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }
}
