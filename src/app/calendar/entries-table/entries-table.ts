import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';
import { TableModule } from 'primeng/table';

import { DATE_FORMAT } from '../../shared/constants/date-constants';
import { CalendarEntry } from '../calendar-models';
import { DayTypeLabelPipe } from '../pipes/day-type-label-pipe';

@Component({
  selector: 'app-entries-table',
  imports: [DatePipe, TableModule, DayTypeLabelPipe],
  templateUrl: './entries-table.html',
  styleUrl: './entries-table.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EntriesTable {
  readonly entries = input.required<CalendarEntry[]>();
  readonly loading = input(false);
  readonly selected = model<CalendarEntry | null>(null);
  readonly rowDblClick = output<CalendarEntry>();

  protected readonly dateFormat = DATE_FORMAT;
}
