import { Routes } from '@angular/router';
import { ReservaListaComponent } from './components/reserva-lista/reserva-lista.component';
import { ReservaFormComponent } from './components/reserva-form/reserva-form.component';
import { ReservaDetalleComponent } from './components/reserva-detalle/reserva-detalle.component';
import { EstadisticasComponent } from './components/estadisticas/estadisticas.component';
import { Parcial2Component } from './parcial2/parcial2.component';
import { DetalleParcial2Component } from './parcial2/detalle-parcial2.component';
import { NoEncontradoParcial2Component } from './parcial2/no-encontrado-parcial2.component';

export const routes: Routes = [
  { path: '', redirectTo: 'reservas', pathMatch: 'full' },
  { path: 'reservas', component: ReservaListaComponent, title: 'Reservas de Espacios' },
  { path: 'reservas/nueva', component: ReservaFormComponent, title: 'Nueva Reserva' },
  { path: 'reservas/:id', component: ReservaDetalleComponent, title: 'Detalle de Reserva' },
  {
    path: 'estadisticas',
    loadComponent: () =>
      import('./components/estadisticas/estadisticas.component').then(
        (m) => m.EstadisticasComponent
      ),
    title: 'Estadísticas'
  },
  { path: 'parcial2', component: Parcial2Component, title: 'Parcial 2 - R1 y R2' },
  { path: 'parcial2/detalle/:codigo', component: DetalleParcial2Component, title: 'Parcial 2 - Detalle' },
  { path: '**', component: NoEncontradoParcial2Component, title: 'Página no encontrada' }
];
