import { Component, inject, signal, computed, Signal } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

const REGEX_CODIGO = /^[A-Z]{2}\d{3}$/;

@Component({
  selector: 'app-detalle-parcial2',
  standalone: true,
  imports: [RouterLink],
  template: `
    <h2>Parcial 2 - Detalle</h2>

    @if (codigoInvalido()) {
      <p class="error">Código inválido</p>
      <a [routerLink]="'/parcial2'">Volver al formulario</a>
    } @else {
      <div class="detalle-datos">
        <p><strong>Código:</strong> {{ codigo() }}</p>
        <p><strong>Cantidad:</strong> {{ cantidad() }}</p>
        <p><strong>Bloques:</strong> {{ bloques() }}</p>
        <p><strong>Margen:</strong> {{ margen() }}</p>
      </div>
      <a [routerLink]="'/parcial2'">Volver al formulario</a>
    }
  `,
  styles: [`
    .error {
      color: #ef4444;
      font-weight: 600;
    }

    .detalle-datos {
      margin-top: 16px;
      padding: 12px;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      background: #f8fafc;
    }

    .detalle-datos p {
      margin: 4px 0;
      font-size: 0.95rem;
      color: #1e293b;
    }

    a[routerLink] {
      display: inline-block;
      margin-top: 12px;
      padding: 6px 12px;
      background: #1e293b;
      color: #fff;
      text-decoration: none;
      border-radius: 4px;
      font-size: 0.9rem;
    }

    a[routerLink]:hover {
      background: #334155;
    }
  `]
})
export class DetalleParcial2Component {
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);

  // Lectura reactiva de parámetros de ruta (sin suscripciones manuales)
  private params = toSignal(this.activatedRoute.params);
  private queryParams = toSignal(this.activatedRoute.queryParams);

  // Señal del código de ruta (:codigo)
  codigo!: Signal<string>;

  // Señal de la cantidad recibida (queryParam), convertida a número
  cantidad!: Signal<number>;

  constructor() {
    // Código de ruta: si no existe, cadena vacía
    this.codigo = computed(() => this.params()?.['codigo'] ?? '');

    // Cantidad desde queryParams, convertida explícitamente a Number
    // Si no existe o es NaN, se muestra 0
    this.cantidad = computed(() => {
      const raw = this.queryParams()?.['cantidad'];
      const numero = Number(raw);
      return Number.isFinite(numero) ? numero : 0;
    });
  }

  // Indica si el código NO cumple el formato /^[A-Z]{2}\d{3}$/
  codigoInvalido = computed(() => !REGEX_CODIGO.test(this.codigo()));

  // Bloques = cantidad / m (m = 6)
  bloques = computed(() => this.cantidad() / 6);

  // Margen = tope - cantidad (tope = 24)
  margen = computed(() => 24 - this.cantidad());
}
