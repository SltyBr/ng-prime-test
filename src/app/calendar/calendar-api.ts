import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, delay, map, of, switchMap, throwError } from 'rxjs';

import { CalendarEntry, CalendarYearDto } from './calendar-models';

const MOCK_DATA_URL = 'mock-data';
const MOCK_DELAY_MS = 1000;
const MOCK_ERROR_RATE = 0.1;

function mockRequest<T>(source$: Observable<T>, rate = MOCK_ERROR_RATE): Observable<T> {
  return of(Math.random()).pipe(
    delay(MOCK_DELAY_MS),
    switchMap((value) => (value > rate ? source$ : throwError(() => new Error()))),
  );
}

@Injectable({ providedIn: 'root' })
export class CalendarApi {
  private readonly http = inject(HttpClient);

  getYears(): Observable<number[]> {
    return mockRequest(this.http.get<number[]>(`${MOCK_DATA_URL}/years.json`));
  }

  getYear(year: number): Observable<CalendarEntry[]> {
    return mockRequest(
      this.http
        .get<CalendarYearDto>(`${MOCK_DATA_URL}/${year}.json`)
        .pipe(map((data) => data.entries)),
    );
  }

  save(entry: CalendarEntry): Observable<CalendarEntry> {
    return mockRequest(of(entry));
  }

  remove(date: string): Observable<string> {
    return mockRequest(of(date));
  }
}
