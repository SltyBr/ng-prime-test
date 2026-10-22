import { Injectable, computed, inject, linkedSignal, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { EMPTY, Observable, catchError, filter, finalize, mergeMap, of, tap } from 'rxjs';

import { CalendarApi } from './calendar-api';
import { CalendarEntry } from './calendar-models';

@Injectable()
export class CalendarStore {
  private readonly api = inject(CalendarApi);

  readonly error = signal<string | null>(null);

  readonly years = toSignal(
    this.api.getYears().pipe(
      catchError(() => {
        this.error.set('Не удалось загрузить список годов');
        return of([]);
      }),
    ),
    { initialValue: [] },
  );

  readonly year = linkedSignal<number[], number | null>({
    source: this.years,
    computation: (years) => {
      const currentYear = new Date().getFullYear();
      return years.includes(currentYear) ? currentYear : (years[0] ?? null);
    },
  });

  readonly selectedDate = linkedSignal<number | null, string | null>({
    source: this.year,
    computation: () => null,
  });

  private readonly entriesByYear = signal<Record<number, CalendarEntry[]>>({});
  private readonly loadingYears = signal<ReadonlySet<number>>(new Set());

  readonly entries = computed(() => {
    const year = this.year();
    return year === null ? [] : (this.entriesByYear()[year] ?? []);
  });

  readonly isLoading = computed(() => {
    const year = this.year();
    return year !== null && this.loadingYears().has(year);
  });

  readonly selectedEntry = computed(
    () => this.entries().find((entry) => entry.date === this.selectedDate()) ?? null,
  );

  constructor() {
    toObservable(this.year)
      .pipe(
        filter((year): year is number => year !== null),
        filter((year) => !this.entriesByYear()[year] && !this.loadingYears().has(year)),
        mergeMap((year) => this.loadYear(year)),
        takeUntilDestroyed(),
      )
      .subscribe();
  }

  selectYear(year: number): void {
    this.year.set(year);
  }

  selectDate(date: string | null): void {
    this.selectedDate.set(date);
  }

  private loadYear(year: number): Observable<CalendarEntry[]> {
    this.error.set(null);
    this.setLoading(year, true);

    return this.api.getYear(year).pipe(
      tap((entries) =>
        this.entriesByYear.update((all) => ({ ...all, [year]: sortByDate(entries) })),
      ),
      catchError(() => {
        this.error.set(`Не удалось загрузить записи за ${year} год`);
        return EMPTY;
      }),
      finalize(() => this.setLoading(year, false)),
    );
  }

  private setLoading(year: number, loading: boolean): void {
    this.loadingYears.update((years) => {
      const next = new Set(years);
      if (loading) {
        next.add(year);
      } else {
        next.delete(year);
      }
      return next;
    });
  }
}

function sortByDate(entries: CalendarEntry[]): CalendarEntry[] {
  return [...entries].sort((a, b) => a.date.localeCompare(b.date));
}
