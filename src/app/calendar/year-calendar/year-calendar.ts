import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { DatePickerDateMeta, DatePickerModule } from 'primeng/datepicker';

import { toIsoDate } from '../calendar-date-utils';
import { CalendarEntry, DayType } from '../calendar-models';

interface MonthView {
  name: string;
  firstDay: Date;
  lastDay: Date;
  isCurrent: boolean;
}

const TODAY_FORMAT = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

const MONTH_NAMES = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь',
];

@Component({
  selector: 'app-year-calendar',
  imports: [DatePickerModule],
  templateUrl: './year-calendar.html',
  styleUrl: './year-calendar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class YearCalendar {
  readonly year = input.required<number>();
  readonly entries = input.required<CalendarEntry[]>();

  private readonly today = new Date();
  protected readonly todayLabel = `Сегодня ${TODAY_FORMAT.format(this.today)}`;

  protected readonly months = computed<MonthView[]>(() =>
    MONTH_NAMES.map((name, month) => ({
      name,
      firstDay: new Date(this.year(), month, 1),
      lastDay: new Date(this.year(), month + 1, 0),
      isCurrent: this.year() === this.today.getFullYear() && month === this.today.getMonth(),
    })),
  );

  private readonly typeByDate = computed(
    () => new Map(this.entries().map((entry) => [entry.date, entry.type])),
  );

  protected dayClasses(meta: DatePickerDateMeta): Record<string, boolean> {
    const type = this.typeByDate().get(toIsoDate(new Date(meta.year, meta.month, meta.day)));
    const weekDay = new Date(meta.year, meta.month, meta.day).getDay();

    return {
      'calendar-day': true,
      'calendar-day--other-month': !!meta.otherMonth,
      'calendar-day--today': !!meta.today,
      'calendar-day--weekend': type === undefined && (weekDay === 0 || weekDay === 6),
      'calendar-day--working': type === DayType.Working,
      'calendar-day--non-working': type === DayType.NonWorking,
    };
  }
}
