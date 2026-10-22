export enum DayType {
  NonWorking = 0,
  Working = 1,
}

export const DAY_TYPE_LABELS: Record<DayType, string> = {
  [DayType.Working]: 'Рабочий',
  [DayType.NonWorking]: 'Нерабочий',
};

export interface CalendarEntry {
  date: string; // YYYY-MM-DD
  type: DayType;
}

export interface CalendarYearDto {
  year: number;
  entries: CalendarEntry[];
}
