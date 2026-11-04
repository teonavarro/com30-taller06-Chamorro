export interface ItemRecurso {
  id: number;
  recurso: string;
  cantidad: number;
}

export type EstadoReserva = 'Pendiente' | 'Aprobada' | 'Rechazada';

export interface Reserva {
  id: number;
  responsable: string;
  espacio: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  asistentes: number;
  recursos: ItemRecurso[];
  estado: EstadoReserva;
}
