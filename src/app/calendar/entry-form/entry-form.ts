import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  linkedSignal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DatePickerModule } from 'primeng/datepicker';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { IftaLabelModule } from 'primeng/iftalabel';
import { SelectModule } from 'primeng/select';

import { findEntryByDate, formatDate, parseIsoDate, toIsoDate } from '../calendar-date-utils';
import { CALENDAR_TEXTS } from '../calendar-constants';
import { CalendarEntry, DAY_TYPE_LABELS, DayType } from '../calendar-models';

@Component({
  selector: 'app-entry-form',
  imports: [
    FormsModule,
    ButtonModule,
    ConfirmDialogModule,
    DatePickerModule,
    IftaLabelModule,
    SelectModule,
  ],
  providers: [ConfirmationService],
  templateUrl: './entry-form.html',
  styleUrl: './entry-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EntryForm {
  private readonly ref = inject<DynamicDialogRef<EntryForm>>(DynamicDialogRef);
  private readonly confirmationService = inject(ConfirmationService);

  readonly entry = input<CalendarEntry>();
  readonly defaultDate = input<string>();
  readonly year = input.required<number>();
  readonly entries = input<CalendarEntry[]>([]);

  protected readonly minDate = computed(() => new Date(this.year(), 0, 1));
  protected readonly maxDate = computed(() => new Date(this.year(), 11, 31));

  protected readonly typeOptions = [DayType.Working, DayType.NonWorking].map(value => ({
    value,
    label: DAY_TYPE_LABELS[value],
  }));

  protected readonly isEdit = computed(() => !!this.entry());
  protected readonly date = linkedSignal<Date | null>(() => {
    const date = this.entry()?.date ?? this.defaultDate();

    return date ? parseIsoDate(date) : null;
  });
  protected readonly type = linkedSignal<DayType | null>(
    () => this.entry()?.type ?? DayType.Working,
  );
  protected readonly isValid = computed(() => this.date() !== null && this.type() !== null);
  protected readonly isChanged = computed(() => {
    const entry = this.entry();
    const date = this.date();

    if (!entry) {
      return true;
    }

    return this.type() !== entry.type || (date !== null && toIsoDate(date) !== entry.date);
  });

  protected submit(): void {
    const date = this.date();
    const type = this.type();
    if (date === null || type === null) {
      return;
    }

    const result: CalendarEntry = { date: toIsoDate(date), type };
    const existing = !this.isEdit() && findEntryByDate(this.entries(), result.date);

    if (!existing) {
      this.ref.close(result);

      return;
    }

    this.confirmationService.confirm({
      header: CALENDAR_TEXTS.duplicateTitle,
      message: CALENDAR_TEXTS.duplicateConfirm(
        formatDate(date),
        DAY_TYPE_LABELS[existing.type],
        existing.type !== type ? DAY_TYPE_LABELS[type] : null,
      ),
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: CALENDAR_TEXTS.duplicateAccept,
      rejectLabel: CALENDAR_TEXTS.cancel,
      rejectButtonProps: { severity: 'secondary', text: true },
      accept: () => this.ref.close(result),
    });
  }

  protected cancel(): void {
    this.ref.close();
  }
}
