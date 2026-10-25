import { LOCALE } from '../shared/constants/date-constants';
import { STANDARD_WEEKEND_DAYS } from './calendar-constants';
import { CalendarEntry, DayType } from './calendar-models';

export function standardDayType(date: Date): DayType {
  return STANDARD_WEEKEND_DAYS.includes(date.getDay()) ? DayType.NonWorking : DayType.Working;
}

export function parseIsoDate(date: string): Date {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function toIsoDate(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function findEntryByDate(
  entries: readonly CalendarEntry[],
  date: string,
): CalendarEntry | undefined {
  return entries.find((entry) => entry.date === date);
}

export const formatDate = (date: Date, locale = LOCALE) => date.toLocaleDateString(locale);
