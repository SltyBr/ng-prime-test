import { Pipe, PipeTransform } from '@angular/core';
import { DatePickerDateMeta } from 'primeng/datepicker';

import { standardDayType, toIsoDate } from '../calendar-date-utils';
import { DayType } from '../calendar-models';

@Pipe({ name: 'dayClasses' })
export class DayClassesPipe implements PipeTransform {
  transform(
    meta: DatePickerDateMeta,
    typeByDate: ReadonlyMap<string, DayType>,
    selected: boolean,
  ): Record<string, boolean> {
    const date = new Date(meta.year, meta.month, meta.day);
    const type = typeByDate.get(toIsoDate(date));

    return {
      'calendar-day': true,
      'calendar-day--other-month': !!meta.otherMonth,
      'calendar-day--today': !!meta.today,
      'calendar-day--selected': selected && !meta.otherMonth,
      'calendar-day--weekend': type === undefined && standardDayType(date) === DayType.NonWorking,
      'calendar-day--working': type === DayType.Working,
      'calendar-day--non-working': type === DayType.NonWorking,
    };
  }
}
