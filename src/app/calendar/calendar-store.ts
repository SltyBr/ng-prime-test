import { Injectable, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CalendarApi } from './calendar-api';
import {
  BehaviorSubject,
  catchError,
  filter,
  map,
  merge,
  of,
  startWith,
  Subject,
  switchMap,
  tap,
} from 'rxjs';
import { CalendarEntry } from './calendar-models';

type EntriesState =
  | { action: 'initLoading' }
  | { action: 'loaded'; data: CalendarEntry[] }
  | { action: 'add'; data: CalendarEntry }
  | { action: 'remove'; data: string }
  | { action: 'error'; reason: 'loaded' | 'add' | 'remove' };

@Injectable()
export class CalendarStore {
  private readonly api = inject(CalendarApi);
  private readonly _reloadYears = new BehaviorSubject<boolean>(true);
  private readonly _reloadYear = new BehaviorSubject<boolean>(true);
  private readonly _addItem = new Subject<CalendarEntry>();
  private readonly _removeItem = new Subject<string>();
  private readonly _selectedYear = new BehaviorSubject<number | null>(null);
  private readonly _entriesCache = new Map<number, CalendarEntry[]>();
  private readonly _selectedEntry = signal<CalendarEntry | null>(null);

  private getEntries$ = this._reloadYear.pipe(
    switchMap(() => {
      return this._selectedYear.pipe(
        filter(Boolean),
        switchMap((year) => {
          const cache = this._entriesCache.get(year);
          const source$ = cache ? of(cache) : this.api.getYear(year);

          return source$.pipe(
            map((value) => ({ action: 'loaded' as const, data: value })),
            startWith({ action: 'initLoading' as const }),
            catchError(() => of({ action: 'error' as const, reason: 'loaded' as const })),
          );
        }),
      );
    }),
  );

  selectedYear = toSignal(this._selectedYear, { initialValue: null });
  selectedEntry = this._selectedEntry.asReadonly();

  getYears = toSignal(
    this._reloadYears.pipe(
      switchMap(() =>
        this.api.getYears().pipe(
          map((data) => ({ isLoading: false, isError: false, data })),
          tap(({ data }) => {
            if (data.length) {
              const year = data[0];
              this._selectedYear.next(year);
            }
          }),
          startWith({ isLoading: true, isError: false, data: [] }),
          catchError(() => of({ isLoading: false, isError: true, data: [] })),
        ),
      ),
    ),
    { initialValue: { isLoading: false, isError: false, data: [] } },
  );

  entries = toSignal(
    merge(
      this._addItem.pipe(
        switchMap((item) =>
          this.api.save(item).pipe(
            map((value) => ({ action: 'add' as const, data: value })),
            startWith({ action: 'initLoading' as const }),
            catchError(() => of({ action: 'error' as const, reason: 'add' as const })),
          ),
        ),
      ),
      this._removeItem.pipe(
        switchMap((value) =>
          this.api.remove(value).pipe(
            tap((date) => {
              if (this.selectedEntry()?.date === date) {
                this.resetSelectedEntry();
              }
            }),
            map((value) => ({ action: 'remove' as const, data: value })),
            startWith({ action: 'initLoading' as const }),
            catchError(() => of({ action: 'error' as const, reason: 'remove' as const })),
          ),
        ),
      ),
      this.getEntries$,
    ).pipe(
      map((state: EntriesState) => {
        const selectedYear = this._selectedYear.value!;

        this.updateCache(selectedYear, state);

        return {
          isLoading: state.action === 'initLoading',
          isError: state.action === 'error' ? { reason: state.reason } : null,
          data: this._entriesCache.get(selectedYear) || [],
        };
      }),
    ),
    {
      initialValue: { isLoading: false, isError: null, data: [] },
    },
  );

  private updateCache(year: number, state: EntriesState): void {
    const cache = this._entriesCache.get(year) || [];

    if (state.action === 'loaded') {
      this._entriesCache.set(year, state.data);
    }

    if (state.action === 'add') {
      this._entriesCache.set(year, [
        ...cache.filter((item) => item.date !== state.data.date),
        state.data,
      ]);
    }

    if (state.action === 'remove') {
      this._entriesCache.set(
        year,
        cache.filter((item) => item.date !== state.data),
      );
    }
  }

  reloadYears(): void {
    this._reloadYears.next(true);
  }

  reloadYear(): void {
    this._reloadYear.next(true);
  }

  changeSelectedYear(year: number): void {
    this.resetSelectedEntry();
    this._selectedYear.next(year);
  }

  addItem(value: CalendarEntry): void {
    this._addItem.next(value);
  }

  removeItem(date: string): void {
    this._removeItem.next(date);
  }

  setSelectedEntry(value: CalendarEntry | null): void {
    this._selectedEntry.set(value);
  }

  resetSelectedEntry(): void {
    this._selectedEntry.set(null);
  }
}
