import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Valida um CNPJ — suporta o novo formato alfanumérico (Serpro).
 *
 * Regras:
 * - 14 posições: as 12 primeiras podem ser números ou letras maiúsculas,
 *   os 2 últimos (Dígitos Verificadores) são SEMPRE numéricos.
 * - Valor de cada caractere = código ASCII − 48.
 * - Cálculo via módulo 11: se resto < 2 → DV = 0, senão DV = 11 − resto.
 */
export function isValidCnpj(value: string | null | undefined): boolean {
  if (!value) return false;

  const clean = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

  if (clean.length !== 14) return false;

  // Rejeita todos os caracteres iguais
  if (/^(.)\1{13}$/.test(clean)) return false;

  // Os 2 últimos caracteres devem ser numéricos
  if (!/^\d{2}$/.test(clean.slice(12))) return false;

  const calcDV = (base: string, weights: number[]): number => {
    let sum = 0;
    for (let i = 0; i < base.length; i++) {
      const charValue = base.charCodeAt(i) - 48;
      sum += charValue * weights[i];
    }
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  const dv1 = calcDV(clean.substring(0, 12), weights1);
  if (dv1 !== parseInt(clean.charAt(12))) return false;

  const dv2 = calcDV(clean.substring(0, 13), weights2);
  if (dv2 !== parseInt(clean.charAt(13))) return false;

  return true;
}

/**
 * ValidatorFn do Angular para campos de CNPJ.
 */
export const cnpjValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  if (!control.value) return null;
  return isValidCnpj(control.value) ? null : { invalidCnpj: true };
};
