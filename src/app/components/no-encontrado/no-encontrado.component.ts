import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-no-encontrado',
  standalone: true,
  imports: [RouterLink],
  template: `
    <h2>404 - Página no encontrada</h2>
    <p>La URL <strong>{{ router.url }}</strong> no existe.</p>
    <a [routerLink]="'/reservas'">Ir al listado de reservas</a>
  `
})
export class NoEncontradoComponent {
  router = inject(Router);
}
