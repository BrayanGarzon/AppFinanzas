export interface MonthBounds {
  startDate: string;
  endDateExclusive: string;
}

function dateKey(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getLocalDateKey(date = new Date()): string {
  return dateKey(date);
}

export function getMonthBounds(date: Date): MonthBounds {
  const first = new Date(date.getFullYear(), date.getMonth(), 1);
  const next = new Date(date.getFullYear(), date.getMonth() + 1, 1);
  return { startDate: dateKey(first), endDateExclusive: dateKey(next) };
}

export function getMonthTitle(date: Date): string {
  return new Intl.DateTimeFormat('es-CO', { month: 'long', year: 'numeric' }).format(date);
}
