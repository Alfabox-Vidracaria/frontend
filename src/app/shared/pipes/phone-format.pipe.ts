import { Pipe, PipeTransform } from '@angular/core';

/**
 * Formata um telefone (8-11 dígitos):
 *   8 dígitos  → 0000-0000
 *  10 dígitos  → (00) 0000-0000
 *  11 dígitos  → (00) 00000-0000
 */
@Pipe({ name: 'phoneFormat' })
export class PhoneFormatPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '';
    const d = value.replace(/\D/g, '');
    if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
    if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
    if (d.length === 8) return `${d.slice(0, 4)}-${d.slice(4)}`;
    return value;
  }
}
