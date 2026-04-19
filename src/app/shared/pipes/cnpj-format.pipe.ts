import { Pipe, PipeTransform } from '@angular/core';

/**
 * Formata uma string de 14 caracteres como CNPJ: XX.XXX.XXX/XXXX-XX
 * Suporta CNPJs alfanuméricos (novo formato Serpro).
 */
@Pipe({ name: 'cnpjFormat' })
export class CnpjFormatPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '';
    // Remove apenas símbolos de formatação, preservando letras e dígitos
    const clean = value.replace(/[.\-\/\s]/g, '').toUpperCase();
    if (clean.length !== 14) return value;
    return `${clean.slice(0, 2)}.${clean.slice(2, 5)}.${clean.slice(5, 8)}/${clean.slice(8, 12)}-${clean.slice(12)}`;
  }
}
