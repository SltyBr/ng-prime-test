export enum DayType {
  NonWorking = 0,
  Working = 1,
}

export interface CalendarEntry {
  date: string; // YYYY-MM-DD
  type: DayType;
}

export interface CalendarYearDto {
  year: number;
  entries: CalendarEntry[];
}
