import { Injectable, computed, inject, linkedSignal, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { EMPTY, Observable, catchError, filter, finalize, mergeMap, of, tap } from 'rxjs';

import { CalendarApi } from './calendar-api';
import { CalendarEntry } from './calendar-models';

@Injectable()
export class CalendarStore {
  private readonly api = inject(CalendarApi);

  readonly yearsError = signal<string | null>(null);
  readonly actionError = signal<string | null>(null);

  private readonly loadedYears = toSignal(
    this.api.getYears().pipe(
      catchError(() => {
        this.yearsError.set('Список лет не прогрузился');

        return of([]);
      }),
    ),
    { initialValue: null },
  );

  readonly years = computed(() => this.loadedYears() ?? []);
  readonly isYearsLoading = computed(() => this.loadedYears() === null);

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
  private readonly failedYears = signal<ReadonlySet<number>>(new Set());

  readonly entries = computed(() => {
    const year = this.year();
    return year === null ? [] : (this.entriesByYear()[year] ?? []);
  });

  readonly isLoading = computed(() => {
    if (this.isYearsLoading()) {
      return true;
    }
    const year = this.year();
    return year !== null && !this.entriesByYear()[year] && !this.failedYears().has(year);
  });

  readonly entriesError = computed(() => {
    const year = this.year();
    return year !== null && this.failedYears().has(year)
      ? `Не удалось загрузить записи за ${year} год`
      : null;
  });

  readonly selectedEntry = computed(
    () => this.entries().find((entry) => entry.date === this.selectedDate()) ?? null,
  );

  constructor() {
    toObservable(this.year)
      .pipe(
        filter(Boolean),
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

  save(entry: CalendarEntry): Observable<CalendarEntry> {
    this.actionError.set(null);
    return this.api.save(entry).pipe(
      tap((saved) => {
        this.updateYear(saved.date, (entries) => [
          ...entries.filter((item) => item.date !== saved.date),
          saved,
        ]);
        this.selectedDate.set(saved.date);
      }),
      catchError(() => {
        this.actionError.set('Не удалось сохранить запись');
        return EMPTY;
      }),
    );
  }

  remove(date: string): Observable<string> {
    this.actionError.set(null);
    return this.api.remove(date).pipe(
      tap((removed) => {
        this.updateYear(removed, (entries) => entries.filter((item) => item.date !== removed));
        this.selectedDate.set(null);
      }),
      catchError(() => {
        this.actionError.set('Не удалось удалить запись');
        return EMPTY;
      }),
    );
  }

  private updateYear(date: string, change: (entries: CalendarEntry[]) => CalendarEntry[]): void {
    const year = Number(date.slice(0, 4));
    console.log('updateYear ', date, year);
    console.log('entriesByYear ', this.entriesByYear());
    this.entriesByYear.update((all) => ({
      ...all,
      [year]: change(all[year] ?? []),
    }));
  }

  private loadYear(year: number): Observable<CalendarEntry[]> {
    this.failedYears.update((years) => toggle(years, year, false));
    this.loadingYears.update((years) => toggle(years, year, true));

    return this.api.getYear(year).pipe(
      tap((entries) => this.entriesByYear.update((all) => ({ ...all, [year]: entries }))),
      catchError(() => {
        this.failedYears.update((years) => toggle(years, year, true));
        return EMPTY;
      }),
      finalize(() => this.loadingYears.update((years) => toggle(years, year, false))),
    );
  }
}

function toggle(years: ReadonlySet<number>, year: number, include: boolean): ReadonlySet<number> {
  const next = new Set(years);
  if (include) {
    next.add(year);
  } else {
    next.delete(year);
  }
  return next;
}
