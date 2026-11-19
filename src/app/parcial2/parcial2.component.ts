import { Component, inject, computed, Signal } from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  FormControl
} from '@angular/forms';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, debounceTime, distinctUntilChanged, scan } from 'rxjs';
import { validadorMultiplo, validadorHastaMayor } from './validadores';
import { ReservaService } from '../services/reserva.service';
import { Reserva } from '../models/reserva';

@Component({
  selector: 'app-parcial2',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <h2>Parcial 2 - Requisito R1 y R2</h2>

    <form [formGroup]="form" (ngSubmit)="onSubmit()">

      <div class="campo">
        <label>Código</label>
        <input type="text" formControlName="codigo" placeholder="Ej. AB123" maxlength="5" />
        @if (codigo.invalid && (codigo.touched || codigo.dirty)) {
          <span class="error">
            @if (codigo.errors?.['required']) {
              El código es obligatorio.
            }
            @if (codigo.errors?.['pattern']) {
              Formato inválido: dos letras mayúsculas y tres dígitos (ej. AB123).
            }
          </span>
        }
      </div>

      <div class="campo">
        <label>Cantidad</label>
        <input type="number" formControlName="cantidad" min="1" max="24" />
        @if (cantidad.invalid && (cantidad.touched || cantidad.dirty)) {
          <span class="error">
            @if (cantidad.errors?.['required']) {
              La cantidad es obligatoria.
            }
            @if (cantidad.errors?.['min']) {
              Mínimo 1.
            }
            @if (cantidad.errors?.['max']) {
              Máximo 24.
            }
            @if (cantidad.errors?.['multiplo']) {
              Debe ser múltiplo de 6.
            }
          </span>
        }
      </div>

      <div class="campo">
        <label>Desde</label>
        <input type="number" formControlName="desde" />
        @if (desde.invalid && (desde.touched || desde.dirty)) {
          <span class="error">Desde es obligatorio.</span>
        }
      </div>

      <div class="campo">
        <label>Hasta</label>
        <input type="number" formControlName="hasta" />
        @if (hasta.invalid && (hasta.touched || hasta.dirty)) {
          <span class="error">Hasta es obligatorio.</span>
        }
      </div>

      @if (
        form.errors?.['hastaMayor'] &&
        (desde.touched || desde.dirty || hasta.touched || hasta.dirty || submitted)
      ) {
        <span class="error grupo">
          Hasta debe ser estrictamente mayor que Desde.
        </span>
      }

      <button type="submit" [disabled]="form.invalid">Enviar</button>

    </form>

    @if (submitted && form.valid) {
      <p class="msg exito">Formulario válido. Listo para navegar al siguiente paso.</p>
    }

    <!-- Sección R2: Búsqueda reactiva sobre el listado de reservas -->
    <div class="seccion-busqueda">
      <h3>Búsqueda de reservas</h3>

      <div class="campo">
        <label>Buscar</label>
        <input type="text" [formControl]="buscar" placeholder="Responsable o espacio..." />
      </div>

      <p><strong>Último valor:</strong> {{ ultimoValor() }}</p>
      <p><strong>Emisiones:</strong> {{ emisiones() }}</p>

      <h4>Resultados filtrados ({{ reservasFiltradas().length }})</h4>
      <table>
        <thead>
          <tr>
            <th>Responsable</th>
            <th>Espacio</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          @for (reserva of reservasFiltradas(); track reserva.id) {
            <tr>
              <td>{{ reserva.responsable }}</td>
              <td>{{ reserva.espacio }}</td>
              <td>{{ reserva.estado }}</td>
            </tr>
          } @empty {
            <tr>
              <td colspan="3">Sin coincidencias</td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .campo {
      display: flex;
      flex-direction: column;
      gap: 4px;
      margin-bottom: 12px;
    }

    label {
      font-weight: 600;
      font-size: 0.9rem;
      color: #1e293b;
    }

    input {
      padding: 6px 8px;
      font-size: 0.95rem;
      border: 1px solid #cbd5e1;
      border-radius: 4px;
    }

    input.ng-invalid.ng-touched,
    input.ng-invalid.ng-dirty {
      border-color: #ef4444;
    }

    span.error {
      color: #ef4444;
      font-size: 0.8rem;
      margin-top: 2px;
    }

    span.error.grupo {
      margin-top: 8px;
      font-weight: 600;
    }

    button[type="submit"] {
      margin-top: 16px;
      padding: 8px 16px;
      font-size: 0.95rem;
      font-weight: 600;
      background: #1e293b;
      color: #fff;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    button[type="submit"]:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .msg.exito {
      color: #15803d;
      font-size: 0.9rem;
      margin-top: 12px;
    }

    .seccion-busqueda {
      margin-top: 32px;
      padding: 16px;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      background: #f8fafc;
    }

    .seccion-busqueda h3 {
      margin-top: 0;
      font-size: 1.1rem;
      color: #1e293b;
    }

    .seccion-busqueda table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 8px;
    }

    .seccion-busqueda th,
    .seccion-busqueda td {
      border: 1px solid #e2e8f0;
      padding: 6px 8px;
      text-align: left;
      font-size: 0.9rem;
    }

    .seccion-busqueda th {
      background: #e2e8f0;
      font-weight: 600;
    }
  `]
})
export class Parcial2Component {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private reservaService = inject(ReservaService);

  form: FormGroup;
  submitted = false;

  // FormControl de búsqueda independiente (R2)
  buscar = new FormControl<string>('', { nonNullable: true });

  // Señal del último valor emitido por el flujo de búsqueda
  ultimoValor!: Signal<string>;

  // Señal del contador de emisiones del flujo de búsqueda
  emisiones!: Signal<number>;

  constructor() {
    this.form = this.fb.nonNullable.group(
      {
        codigo: ['', [Validators.required, Validators.pattern(/^[A-Z]{2}\d{3}$/)]],
        cantidad: [
          6,
          [
            Validators.required,
            Validators.min(1),
            Validators.max(24),
            validadorMultiplo(6)
          ]
        ],
        desde: [10, Validators.required],
        hasta: [11, Validators.required]
      },
      { validators: [validadorHastaMayor()] }
    );

    // Flujo reactivo de búsqueda (R2):
    // 1) trim, 2) debounceTime(300), 3) distinctUntilChanged
    const textoBusqueda$ = this.buscar.valueChanges.pipe(
      map((v) => v.trim()),
      debounceTime(300),
      distinctUntilChanged()
    );

    // Último valor emitido (inicialmente vacío)
    this.ultimoValor = toSignal(textoBusqueda$, { initialValue: '' });

    // Contador de emisiones: se incrementa por cada emisión válida del flujo.
    // scan acumula el conteo; toSignal gestiona la suscripción y limpieza automáticamente.
    this.emisiones = toSignal(
      textoBusqueda$.pipe(
        scan((acc) => acc + 1, 0)
      ),
      { initialValue: 0 }
    );
  }

  // Getters de controles (tipado estricto, sin any)
  get codigo() {
    return this.form.get('codigo')!;
  }

  get cantidad() {
    return this.form.get('cantidad')!;
  }

  get desde() {
    return this.form.get('desde')!;
  }

  get hasta() {
    return this.form.get('hasta')!;
  }

  // Listado base del servicio (reservas existentes del proyecto)
  reservasBase: Signal<ReadonlyArray<Reserva>> = this.reservaService.reservas;

  // Filtro inmutable sobre el listado base (no muta arreglos, devuelve nuevo)
  reservasFiltradas = computed(() => {
    const texto = this.ultimoValor();
    if (!texto) {
      return this.reservasBase();
    }
    const normalizado = texto.toLowerCase();
    return this.reservasBase().filter(
      (r: Reserva) =>
        r.responsable.toLowerCase().includes(normalizado) ||
        r.espacio.toLowerCase().includes(normalizado)
    );
  });

  onSubmit() {
    this.submitted = true;
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      return;
    }

    const codigo = this.codigo.value;
    const cantidad = this.cantidad.value;

    this.router.navigate(['/parcial2/detalle', codigo], {
      queryParams: { cantidad: cantidad.toString() }
    });
  }
}
