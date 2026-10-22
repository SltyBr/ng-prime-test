import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';
import { TableModule } from 'primeng/table';

import { CalendarEntry, DAY_TYPE_LABELS } from '../calendar.models';

@Component({
  selector: 'app-entries-table',
  imports: [DatePipe, TableModule],
  templateUrl: './entries-table.html',
  styleUrl: './entries-table.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EntriesTable {
  readonly entries = input.required<CalendarEntry[]>();
  readonly selected = model<CalendarEntry | null>(null);
  readonly rowDblClick = output<CalendarEntry>();

  typeLabel(entry: CalendarEntry): string {
    return DAY_TYPE_LABELS[entry.type];
  }
}
