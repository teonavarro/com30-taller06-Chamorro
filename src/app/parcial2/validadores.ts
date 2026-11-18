import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Valida que el valor numérico sea múltiplo de `m`.
 *
 * Reglas:
 * - Si el valor está vacío, es null, undefined o es <= 0, retorna null
 *   (para no pisar el error de min cuando cantidad = 0).
 * - Si valor % m !== 0, retorna { multiplo: true }.
 * - En cualquier otro caso, retorna null.
 *
 * No muta el valor del control.
 */
export function validadorMultiplo(m: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const valor = control.value;

    if (valor === '' || valor === null || valor === undefined) {
      return null;
    }

    const numero = Number(valor);
    if (!Number.isFinite(numero)) {
      return null;
    }

    // Si es <= 0, no reportamos multiplo (deja que el validador min se encargue)
    if (numero <= 0) {
      return null;
    }

    if (numero % m !== 0) {
      return { multiplo: true };
    }

    return null;
  };
}

/**
 * Validador a nivel de FormGroup.
 * Compara los controles 'desde' y 'hasta'.
 *
 * Reglas:
 * - Si hasta <= desde, retorna { hastaMayor: true }.
 * - En cualquier otro caso, retorna null.
 *
 * No muta los valores de los controles.
 */
export function validadorHastaMayor(): ValidatorFn {
  return (grupo: AbstractControl): ValidationErrors | null => {
    const desdeControl = grupo.get('desde');
    const hastaControl = grupo.get('hasta');

    if (!desdeControl || !hastaControl) {
      return null;
    }

    const desde = desdeControl.value;
    const hasta = hastaControl.value;

    if (desde === '' || desde === null || desde === undefined) {
      return null;
    }

    if (hasta === '' || hasta === null || hasta === undefined) {
      return null;
    }

    const desdeNum = Number(desde);
    const hastaNum = Number(hasta);

    if (!Number.isFinite(desdeNum) || !Number.isFinite(hastaNum)) {
      return null;
    }

    if (hastaNum <= desdeNum) {
      return { hastaMayor: true };
    }

    return null;
  };
}
