import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, delay, map, of } from 'rxjs';

import { CalendarEntry, CalendarYearDto } from './calendar-models';

const MOCK_DATA_URL = 'mock-data';
const MOCK_DELAY_MS = 400;

@Injectable({ providedIn: 'root' })
export class CalendarApi {
  private readonly http = inject(HttpClient);

  getYears(): Observable<number[]> {
    return this.http.get<number[]>(`${MOCK_DATA_URL}/years.json`).pipe(delay(MOCK_DELAY_MS));
  }

  getYear(year: number): Observable<CalendarEntry[]> {
    return this.http.get<CalendarYearDto>(`${MOCK_DATA_URL}/${year}.json`).pipe(
      map((dto) => dto.entries),
      delay(MOCK_DELAY_MS),
    );
  }

  save(entry: CalendarEntry): Observable<CalendarEntry> {
    return of(entry).pipe(delay(MOCK_DELAY_MS));
  }

  remove(date: string): Observable<string> {
    return of(date).pipe(delay(MOCK_DELAY_MS));
  }
}
