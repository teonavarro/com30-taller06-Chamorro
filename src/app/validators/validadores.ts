import { AbstractControl, ValidationErrors, ValidatorFn, FormArray } from '@angular/forms';

/**
 * Validador de control propio.
 * Rechaza cadenas que sean solo espacios en blanco.
 * Validators.required las acepta, este validador no.
 * Error: { soloEspacios: true }
 */
export function noSinEspacios(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const valor = control.value;
    if (typeof valor === 'string' && valor.trim() === '') {
      return { soloEspacios: true };
    }
    return null;
  };
}

/**
 * Validador de grupo.
 * Compara 'horaInicio' y 'horaFin'. Exige que horaFin sea estrictamente posterior.
 * Error en el grupo: { rangoInvalido: true }
 */
export function rangoHorarios(): ValidatorFn {
  return (grupo: AbstractControl): ValidationErrors | null => {
    const inicio = grupo.get('horaInicio')?.value;
    const fin = grupo.get('horaFin')?.value;

    if (!inicio || !fin) {
      return null;
    }

    const inicioDate = new Date(`1970-01-01T${inicio}:00`);
    const finDate = new Date(`1970-01-01T${fin}:00`);

    if (isNaN(inicioDate.getTime()) || isNaN(finDate.getTime())) {
      return null;
    }

    if (finDate <= inicioDate) {
      return { rangoInvalido: true };
    }

    return null;
  };
}

/**
 * Validador de FormArray.
 * Garantiza que el FormArray tenga al menos 'min' elementos.
 * Error: { minimoFilasInvalido: true }
 */
export function minimoFilas(min: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const array = control as FormArray;
    if (array.length < min) {
      return { minimoFilasInvalido: true };
    }
    return null;
  };
}
