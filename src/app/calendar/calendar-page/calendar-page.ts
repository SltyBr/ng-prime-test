import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterRenderEffect,
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

import { CALENDAR_TEXTS } from '../calendar-constants';
import { formatDate, parseIsoDate } from '../calendar-date-utils';
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
  protected readonly texts = CALENDAR_TEXTS;

  private readonly calendarScroll = viewChild.required<ElementRef<HTMLElement>>('calendarScroll');

  constructor() {
    afterRenderEffect(() => {
      this.store.year();
      this.calendarScroll().nativeElement.scrollTo({ top: 0 });
    });
  }

  openCreateDialog(date?: string): void {
    this.openEntryDialog(CALENDAR_TEXTS.createTitle, { defaultDate: date });
  }

  openEditDialog(entry: CalendarEntry): void {
    this.openEntryDialog(CALENDAR_TEXTS.editTitle, { entry });
  }

  openDialogForDate(date: string): void {
    const entry = this.store.entries().find((item) => item.date === date);

    if (entry) {
      this.openEditDialog(entry);
    } else {
      this.openCreateDialog(date);
    }
  }

  removeSelected(): void {
    const entry = this.store.selectedEntry();
    if (!entry) {
      return;
    }

    const date = parseIsoDate(entry.date);
    this.confirmationService.confirm({
      header: CALENDAR_TEXTS.removeTitle,
      message: CALENDAR_TEXTS.removeConfirm(formatDate(date), DAY_TYPE_LABELS[entry.type]),
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: CALENDAR_TEXTS.removeAccept,
      rejectLabel: CALENDAR_TEXTS.cancel,
      acceptButtonProps: { severity: 'danger' },
      rejectButtonProps: { severity: 'secondary', text: true },
      accept: () =>
        this.store
          .remove(entry.date)
          .subscribe({ error: () => this.showError(CALENDAR_TEXTS.removeError) }),
      dismissableMask: true,
    });
  }

  private openEntryDialog(
    header: string,
    inputs: { entry?: CalendarEntry; defaultDate?: string },
  ): void {
    const year = this.store.year();

    if (year === null) {
      return;
    }

    this.dialogService
      .open(EntryForm, {
        header,
        modal: true,
        closable: true,
        width: '26rem',
        inputValues: { ...inputs, year, entries: this.store.entries() },
        dismissableMask: true,
        focusOnShow: false,
      })
      ?.onClose.pipe(
        take(1),
        filter(Boolean),
        switchMap((result) => this.store.save(result)),
      )
      .subscribe({ error: () => this.showError(CALENDAR_TEXTS.saveError) });
  }

  private showError(detail: string): void {
    this.messageService.add({ severity: 'error', summary: CALENDAR_TEXTS.errorSummary, detail });
  }
}
