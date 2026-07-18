/**
 * Format an ISO date string for list/detail display.
 * Returns an em dash when the value is missing or invalid.
 */
export function formatDisplayDate(
  value: string | null | undefined,
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  },
): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat(undefined, options).format(date);
}
