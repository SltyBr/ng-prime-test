import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterRenderEffect,
  computed,
  input,
  output,
  viewChildren,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePickerDateMeta, DatePickerModule } from 'primeng/datepicker';

import { parseIsoDate, toIsoDate } from '../calendar-date-utils';
import { CalendarEntry } from '../calendar-models';
import { DayClassesPipe } from '../pipes/day-classes-pipe';
import { LOCALE, MONTH_NAMES } from '../../shared/constants/date-constants';
import { CALENDAR_TEXTS } from '../calendar-constants';

interface MonthView {
  name: string;
  firstDay: Date;
  lastDay: Date;
  isCurrent: boolean;
}

const TODAY_FORMAT = new Intl.DateTimeFormat(LOCALE, {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

@Component({
  selector: 'app-year-calendar',
  imports: [FormsModule, DatePickerModule, DayClassesPipe],
  templateUrl: './year-calendar.html',
  styleUrl: './year-calendar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class YearCalendar {
  readonly year = input.required<number>();
  readonly entries = input.required<CalendarEntry[]>();
  readonly selectedDate = input<string | null>(null);
  readonly dateSelect = output<string>();
  readonly dateDblClick = output<string>();

  private readonly monthElements = viewChildren<ElementRef<HTMLElement>>('monthElement');

  private readonly today = new Date();
  private emittedDate: string | null = null;
  protected readonly todayLabel = CALENDAR_TEXTS.today(TODAY_FORMAT.format(this.today));

  protected readonly months = computed<MonthView[]>(() =>
    MONTH_NAMES.map((name, month) => ({
      name,
      firstDay: new Date(this.year(), month, 1),
      lastDay: new Date(this.year(), month + 1, 0),
      isCurrent: this.year() === this.today.getFullYear() && month === this.today.getMonth(),
    })),
  );

  protected readonly selectedDay = computed(() => {
    const date = this.selectedDate();

    return date ? parseIsoDate(date) : null;
  });

  protected readonly selectedMonth = computed(() => {
    const day = this.selectedDay();

    return day && day.getFullYear() === this.year() ? day.getMonth() : null;
  });

  protected readonly typeByDate = computed(
    () => new Map(this.entries().map((entry) => [entry.date, entry.type])),
  );

  constructor() {
    afterRenderEffect({
      write: () => {
        if (this.selectedDate() === this.emittedDate) {
          return;
        }

        const day = this.selectedDay();
        const month = this.selectedMonth();
        if (day === null || month === null) {
          return;
        }
        const monthElement = this.monthElements()[month]?.nativeElement;
        const dayCells = Array.from(
          monthElement?.querySelectorAll('.calendar-day:not(.calendar-day--other-month)') ?? [],
        );
        const dayElement = dayCells.find(
          (element) => element.textContent?.trim() === String(day.getDate()),
        );

        dayElement?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      },
    });
  }

  protected onSelect(date: Date): void {
    this.emittedDate = toIsoDate(date);
    this.dateSelect.emit(this.emittedDate);
  }

  protected onDateDblClick(meta: DatePickerDateMeta): void {
    if (meta.otherMonth) {
      return;
    }
    this.dateDblClick.emit(toIsoDate(new Date(meta.year, meta.month, meta.day)));
  }
}
