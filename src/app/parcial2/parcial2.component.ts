import { Component, inject } from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';
import { validadorMultiplo, validadorHastaMayor } from './validadores';

@Component({
  selector: 'app-parcial2',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <h2>Parcial 2 - Requisito R1</h2>
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
  `]
})
export class Parcial2Component {
  private fb = inject(FormBuilder);
  private router = inject(Router);

  form: FormGroup;
  submitted = false;

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

  onSubmit() {
    this.submitted = true;
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      return;
    }

    // Preparado para navegar en el siguiente paso (R2)
    // Ejemplo: this.router.navigate(['/parcial2/resultado']);
  }
}
