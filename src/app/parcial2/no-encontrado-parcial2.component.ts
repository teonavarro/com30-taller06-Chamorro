import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-no-encontrado-parcial2',
  standalone: true,
  imports: [RouterLink],
  template: `
    <h2>404 - Página no encontrada</h2>
    <p>La URL <strong>{{ router.url }}</strong> no existe.</p>
    <a [routerLink]="'/parcial2'">Volver al formulario Parcial 2</a>
  `
})
export class NoEncontradoParcial2Component {
  router = inject(Router);
}
