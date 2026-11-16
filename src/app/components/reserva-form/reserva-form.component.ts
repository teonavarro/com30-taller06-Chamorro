import { Component, inject } from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  FormArray,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';
import { ReservaService } from '../../services/reserva.service';
import { Reserva } from '../../models/reserva';
import { noSinEspacios, rangoHorarios, minimoFilas } from '../../validators/validadores';

@Component({
  selector: 'app-reserva-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <h2>Nueva Reserva de Espacio</h2>
    <form [formGroup]="form" (ngSubmit)="onSubmit()">

      <div class="campo">
        <label>Responsable</label>
        <input type="text" formControlName="responsable" placeholder="Nombre del responsable" />
        @if (responsable.invalid && (responsable.touched || responsable.dirty)) {
          <span class="error">
            @if (responsable.errors?.['required']) { El responsable es obligatorio. }
            @if (responsable.errors?.['soloEspacios']) { No puede ser solo espacios. }
            @if (responsable.errors?.['minlength']) { Mínimo 3 caracteres. }
          </span>
        }
      </div>

      <div class="campo">
        <label>Espacio</label>
        <input type="text" formControlName="espacio" placeholder="Ej. Sala de juntas" />
        @if (espacio.invalid && (espacio.touched || espacio.dirty)) {
          <span class="error">El espacio es obligatorio.</span>
        }
      </div>

      <div class="campo">
        <label>Fecha</label>
        <input type="date" formControlName="fecha" />
        @if (fecha.invalid && (fecha.touched || fecha.dirty)) {
          <span class="error">La fecha es obligatoria.</span>
        }
      </div>

      <div class="campo">
        <label>Hora Inicio</label>
        <input type="time" formControlName="horaInicio" />
      </div>
      <div class="campo">
        <label>Hora Fin</label>
        <input type="time" formControlName="horaFin" />
        @if (horaFin.invalid && (horaFin.touched || horaFin.dirty)) {
          <span class="error">
            @if (form.errors?.['rangoInvalido']) {
              La hora fin debe ser posterior a la hora inicio.
            }
          </span>
        }
      </div>

      <div class="campo">
        <label>Asistentes</label>
        <input type="number" formControlName="asistentes" min="1" />
        @if (asistentes.invalid && (asistentes.touched || asistentes.dirty)) {
          <span class="error">
            @if (asistentes.errors?.['required']) { Los asistentes son obligatorios. }
            @if (asistentes.errors?.['min']) { Mínimo 1 asistente. }
          </span>
        }
      </div>

      <fieldset>
        <legend>Recursos (lista dinámica)</legend>
        <div formArrayName="recursos">
          @for (fila of recursos.controls; track $index) {
            <div [formGroupName]="$index" class="fila">
              <input type="text" formControlName="recurso" placeholder="Nombre del recurso" />
              <input type="number" formControlName="cantidad" placeholder="Cantidad" min="1" />
              @if (fila.get('recurso')!.invalid && (fila.get('recurso')!.touched || fila.get('recurso')!.dirty)) {
                <span class="error">Recurso obligatorio.</span>
              }
              @if (fila.get('cantidad')!.invalid && (fila.get('cantidad')!.touched || fila.get('cantidad')!.dirty)) {
                <span class="error">Cantidad obligatoria (mínimo 1).</span>
              }
              <button type="button" (click)="eliminarFila($index)" [disabled]="recursos.length <= 1">
                Eliminar
              </button>
            </div>
          } @empty {
            <p>No hay recursos agregados.</p>
          }
        </div>
        <button type="button" (click)="agregarFila()">+ Agregar recurso</button>
      </fieldset>

      <button type="submit" [disabled]="form.invalid">Guardar Reserva</button>
    </form>

    @if (form.invalid && (form.touched || form.dirty)) {
      <p class="error">Corrige los errores del formulario antes de continuar.</p>
    }
  `
})
export class ReservaFormComponent {
  private fb = inject(FormBuilder);
  private reservaService = inject(ReservaService);
  private router = inject(Router);

  form: FormGroup;

  constructor() {
    this.form = this.fb.nonNullable.group(
      {
        responsable: ['', [Validators.required, noSinEspacios, Validators.minLength(3)]],
        espacio: ['', Validators.required],
        fecha: ['', Validators.required],
        horaInicio: ['', Validators.required],
        horaFin: ['', Validators.required],
        asistentes: [1, [Validators.required, Validators.min(1)]],
        recursos: this.fb.nonNullable.array([this.crearFilaRecurso()], [minimoFilas(1)])
      },
      { validators: [rangoHorarios] }
    );
  }

  // Getters de controles de cabecera
  get responsable() {
    return this.form.get('responsable')!;
  }
  get espacio() {
    return this.form.get('espacio')!;
  }
  get fecha() {
    return this.form.get('fecha')!;
  }
  get horaInicio() {
    return this.form.get('horaInicio')!;
  }
  get horaFin() {
    return this.form.get('horaFin')!;
  }
  get asistentes() {
    return this.form.get('asistentes')!;
  }

  // Getter del FormArray de recursos
  get recursos(): FormArray<FormGroup> {
    return this.form.get('recursos') as FormArray<FormGroup>;
  }

  private crearFilaRecurso(): FormGroup {
    return this.fb.nonNullable.group({
      recurso: ['', Validators.required],
      cantidad: [1, [Validators.required, Validators.min(1)]]
    });
  }

  agregarFila() {
    this.recursos.push(this.crearFilaRecurso());
  }

  eliminarFila(index: number) {
    if (this.recursos.length <= 1) {
      return;
    }
    this.recursos.removeAt(index);
  }

  onSubmit() {
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      return;
    }

    const raw = this.form.getRawValue() as any;

    const reserva: Omit<Reserva, 'id' | 'estado'> = {
      responsable: raw.responsable,
      espacio: raw.espacio,
      fecha: raw.fecha,
      horaInicio: raw.horaInicio,
      horaFin: raw.horaFin,
      asistentes: Number(raw.asistentes),
      recursos: raw.recursos.map((r: any, i: number) => ({
        id: i + 1,
        recurso: r.recurso,
        cantidad: Number(r.cantidad)
      }))
    };

    const nuevoId = this.reservaService.agregarReserva(reserva);
    this.form.reset();
    this.router.navigate(['/reservas', nuevoId]);
  }
}