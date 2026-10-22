import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterRenderEffect,
  effect,
  inject,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogService } from 'primeng/dynamicdialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SelectModule } from 'primeng/select';
import { filter, switchMap, take } from 'rxjs';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';

import { parseIsoDate } from '../calendar-date-utils';
import { CalendarEntry, DAY_TYPE_LABELS } from '../calendar-models';
import { CalendarStore } from '../calendar-store';
import { EntriesTable } from '../entries-table/entries-table';
import { EntryForm } from '../entry-form/entry-form';
import { YearCalendar } from '../year-calendar/year-calendar';

@Component({
  selector: 'app-calendar-page',
  imports: [
    FormsModule,
    ButtonModule,
    ConfirmDialogModule,
    ProgressSpinnerModule,
    SelectModule,
    ToastModule,
    ToolbarModule,
    EntriesTable,
    YearCalendar,
  ],
  providers: [CalendarStore, DialogService, ConfirmationService, MessageService],
  templateUrl: './calendar-page.html',
  styleUrl: './calendar-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarPage {
  private readonly dialogService = inject(DialogService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);
  protected readonly store = inject(CalendarStore);

  private readonly calendarScroll = viewChild.required<ElementRef<HTMLElement>>('calendarScroll');

  constructor() {
    afterRenderEffect(() => {
      this.store.year();
      this.calendarScroll().nativeElement.scrollTo({ top: 0 });
    });

    effect(() => {
      const error = this.store.actionError();
      if (error) {
        this.messageService.add({ severity: 'error', summary: 'Ошибка', detail: error });
      }
    });
  }

  openEntryDialog(entry?: CalendarEntry): void {
    const year = this.store.year();
    if (year === null) {
      return;
    }

    this.dialogService
      .open(EntryForm, {
        header: entry ? 'Изменить запись' : 'Добавить запись',
        modal: true,
        closable: true,
        width: '26rem',
        inputValues: { entry, year, entries: this.store.entries() },
        dismissableMask: true,
      })
      ?.onClose.pipe(
        take(1),
        filter(Boolean),
        switchMap((result) => this.store.save(result)),
      )
      .subscribe();
  }

  removeSelected(): void {
    const entry = this.store.selectedEntry();
    if (!entry) {
      return;
    }

    const date = parseIsoDate(entry.date);
    this.confirmationService.confirm({
      header: 'Удалить запись',
      message: `Удалить запись ${date.toLocaleDateString('ru-RU')} («${DAY_TYPE_LABELS[entry.type]}»)? `,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Удалить',
      rejectLabel: 'Отмена',
      acceptButtonProps: { severity: 'danger' },
      rejectButtonProps: { severity: 'secondary', text: true },
      accept: () => this.store.remove(entry.date).subscribe(),
      dismissableMask: true,
    });
  }
}
