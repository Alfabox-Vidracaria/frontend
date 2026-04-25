/**
 * Utilitários para aritmética monetária segura no frontend.
 *
 * JavaScript usa IEEE 754 (ponto flutuante binário), então operações como
 * `0.1 + 0.2` resultam em `0.30000000000000004`.
 * Em somas de valores monetários exibidos na UI, isso pode causar resultados
 * visualmente errados (ex: R$ 1.000,000000000001).
 *
 * Solução: converter para centavos (inteiros) antes de operar,
 * depois converter de volta apenas para exibição.
 * Inteiros em JS são exatos até Number.MAX_SAFE_INTEGER (~90 trilhões de centavos).
 *
 * @example
 * sumCurrency([0.1, 0.2])           // 0.3  ✅  (não 0.30000000000000004)
 * sumField(rows, r => r.totalAmount) // soma exata de todos os totalAmount
 */

/** Converte reais para centavos (inteiro). Ex: 1234.56 → 123456 */
export const toCents = (value: number): number => Math.round(value * 100);

/** Converte centavos de volta para reais. Ex: 123456 → 1234.56 */
export const fromCents = (cents: number): number => cents / 100;

/**
 * Soma um array de valores monetários de forma segura.
 * @example sumCurrency([100.1, 200.2, 300.3]) // 600.6
 */
export const sumCurrency = (values: number[]): number =>
  fromCents(values.reduce((acc, v) => acc + toCents(v), 0));

/**
 * Soma um campo numérico de um array de objetos de forma segura.
 * @example sumField(orders, o => o.totalAmount)
 */
export const sumField = <T>(items: T[], selector: (item: T) => number): number =>
  sumCurrency(items.map(selector));

/**
 * Subtração monetária segura entre dois valores.
 * @example subtractCurrency(1000.3, 400.1) // 600.2
 */
export const subtractCurrency = (a: number, b: number): number =>
  fromCents(toCents(a) - toCents(b));
