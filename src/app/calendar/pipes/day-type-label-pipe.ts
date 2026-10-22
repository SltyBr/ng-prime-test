import { Pipe, PipeTransform } from '@angular/core';

import { DAY_TYPE_LABELS, DayType } from '../calendar-models';

@Pipe({ name: 'dayTypeLabel' })
export class DayTypeLabelPipe implements PipeTransform {
  transform(type: DayType): string {
    return DAY_TYPE_LABELS[type];
  }
}
