import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogService } from 'primeng/dynamicdialog';
import { SelectModule } from 'primeng/select';
import { take } from 'rxjs';
import { ToolbarModule } from 'primeng/toolbar';

import { CalendarEntry } from '../calendar-models';
import { CalendarStore } from '../calendar-store';
import { EntriesTable } from '../entries-table/entries-table';
import { EntryForm } from '../entry-form/entry-form';
import { YearCalendar } from '../year-calendar/year-calendar';

@Component({
  selector: 'app-calendar-page',
  imports: [FormsModule, ButtonModule, SelectModule, ToolbarModule, EntriesTable, YearCalendar],
  providers: [CalendarStore, DialogService],
  templateUrl: './calendar-page.html',
  styleUrl: './calendar-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarPage {
  private readonly dialogService = inject(DialogService);
  protected readonly store = inject(CalendarStore);

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
