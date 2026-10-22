import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogService } from 'primeng/dynamicdialog';
import { SelectModule } from 'primeng/select';
import { take } from 'rxjs';
import { ToolbarModule } from 'primeng/toolbar';

import { CalendarEntry, DayType } from '../calendar.models';
import { EntriesTable } from '../entries-table/entries-table';
import { EntryForm } from '../entry-form/entry-form';
import { YearCalendar } from '../year-calendar/year-calendar';

// TODO: заменить на данные из стора
const PLACEHOLDER_ENTRIES: CalendarEntry[] = [
  { date: '2026-08-11', type: DayType.Working },
  { date: '2026-08-13', type: DayType.NonWorking },
  { date: '2026-08-21', type: DayType.Working },
  { date: '2026-09-02', type: DayType.NonWorking },
  { date: '2026-09-14', type: DayType.Working },
  { date: '2026-09-23', type: DayType.NonWorking },
];

@Component({
  selector: 'app-calendar-page',
  imports: [FormsModule, ButtonModule, SelectModule, ToolbarModule, EntriesTable, YearCalendar],
  providers: [DialogService],
  templateUrl: './calendar-page.html',
  styleUrl: './calendar-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarPage {
  private readonly dialogService = inject(DialogService);

  protected readonly years = [2026, 2027];
  protected readonly year = signal(2026);
  protected readonly entries = signal(PLACEHOLDER_ENTRIES);
  protected readonly selected = signal<CalendarEntry | null>(null);

  openEntryDialog(entry?: CalendarEntry): void {
    this.dialogService
      .open(EntryForm, {
        header: entry ? 'Изменить запись' : 'Добавить запись',
        modal: true,
        closable: true,
        width: '26rem',
        inputValues: { entry },
        dismissableMask: true,
      })
      ?.onClose.pipe(take(1))
      .subscribe((result?: CalendarEntry) => {
        if (result) {
          // TODO: сохранить через стор
          console.log('entry dialog result', result);
        }
      });
  }
}
