import type { Cop } from '@/types/finance';

/** Formats whole COP pesos without inventing fractional values. */
export function formatCop(amountCop: Cop): string {
  if (!Number.isSafeInteger(amountCop)) throw new RangeError('COP amount must be a safe integer');
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(amountCop);
}
