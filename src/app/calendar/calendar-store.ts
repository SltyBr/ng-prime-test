import { Injectable, computed, inject, linkedSignal, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { EMPTY, Observable, catchError, filter, map, mergeMap, of, tap } from 'rxjs';

import { LoadState } from '../shared/types/load-state';
import { CalendarApi } from './calendar-api';
import { getYear } from './calendar-date-utils';
import { CalendarEntry } from './calendar-models';

@Injectable()
export class CalendarStore {
  private readonly api = inject(CalendarApi);

  readonly yearsState = toSignal(
    this.api.getYears().pipe(
      map((data): LoadState<number[]> => ({ status: 'loaded', data })),
      catchError(() => of<LoadState<number[]>>({ status: 'error' })),
    ),
    { initialValue: { status: 'loading' } },
  );

  readonly years = computed(() => {
    const state = this.yearsState();
    return state.status === 'loaded' ? state.data : [];
  });

  private readonly _year = linkedSignal<number[], number | null>({
    source: this.years,
    computation: (years) => {
      const currentYear = new Date().getFullYear();
      return years.includes(currentYear) ? currentYear : (years[0] ?? null);
    },
  });
  readonly year = this._year.asReadonly();

  private readonly _selectedDate = linkedSignal<number | null, string | null>({
    source: this._year,
    computation: () => null,
  });
  readonly selectedDate = this._selectedDate.asReadonly();

  private readonly yearStates = signal<Record<number, LoadState<CalendarEntry[]>>>({});

  readonly yearState = computed<LoadState<CalendarEntry[]>>(() => {
    const year = this.year();
    if (year === null) {
      return this.yearsState().status === 'loading'
        ? { status: 'loading' }
        : { status: 'loaded', data: [] };
    }

    return this.yearStates()[year] ?? { status: 'loading' };
  });

  readonly entries = computed(() => {
    const state = this.yearState();
    return state.status === 'loaded' ? state.data : [];
  });

  readonly selectedEntry = computed(
    () => this.entries().find((entry) => entry.date === this.selectedDate()) ?? null,
  );

  constructor() {
    toObservable(this.year)
      .pipe(
        filter(Boolean),
        filter((year) => {
          const status = this.yearStates()[year]?.status;
          return !status || status === 'error';
        }),
        mergeMap((year) => this.loadYear(year)),
        takeUntilDestroyed(),
      )
      .subscribe();
  }

  selectYear(year: number): void {
    this._year.set(year);
  }

  selectDate(date: string | null): void {
    this._selectedDate.set(date);
  }

  save(entry: CalendarEntry): Observable<CalendarEntry> {
    return this.api.save(entry).pipe(
      tap((saved) => {
        this.upsertEntry(saved);
        this._selectedDate.set(saved.date);
      }),
    );
  }

  remove(date: string): Observable<string> {
    return this.api.remove(date).pipe(
      tap((removed) => {
        this.removeEntry(removed);
        this._selectedDate.set(null);
      }),
    );
  }

  private upsertEntry(entry: CalendarEntry): void {
    const year = getYear(entry.date);
    const entries = this.loadedEntries(year).filter((item) => item.date !== entry.date);
    this.setYearState(year, { status: 'loaded', data: [...entries, entry] });
  }

  private removeEntry(date: string): void {
    const year = getYear(date);
    const entries = this.loadedEntries(year).filter((item) => item.date !== date);
    this.setYearState(year, { status: 'loaded', data: entries });
  }

  private loadedEntries(year: number): CalendarEntry[] {
    const state = this.yearStates()[year];
    return state?.status === 'loaded' ? state.data : [];
  }

  private setYearState(year: number, state: LoadState<CalendarEntry[]>): void {
    this.yearStates.update((all) => ({ ...all, [year]: state }));
  }

  private loadYear(year: number): Observable<CalendarEntry[]> {
    this.setYearState(year, { status: 'loading' });

    return this.api.getYear(year).pipe(
      tap((data) => this.setYearState(year, { status: 'loaded', data })),
      catchError(() => {
        this.setYearState(year, { status: 'error' });

        return EMPTY;
      }),
    );
  }
}
