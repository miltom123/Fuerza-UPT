export function parseApiDate(value: string): Date | null {
  const dateOnly = /^\d{4}-\d{2}-\d{2}/.exec(value)?.[0];
  const date = new Date(dateOnly ? `${dateOnly}T12:00:00` : value);
  return Number.isNaN(date.getTime()) ? null : date;
}
