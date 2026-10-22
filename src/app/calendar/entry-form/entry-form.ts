import { ChangeDetectionStrategy, Component, computed, inject, input, linkedSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { IftaLabelModule } from 'primeng/iftalabel';
import { SelectModule } from 'primeng/select';

import { parseIsoDate, toIsoDate } from '../calendar-date-utils';
import { CalendarEntry, DAY_TYPE_LABELS, DayType } from '../calendar-models';

@Component({
  selector: 'app-entry-form',
  imports: [FormsModule, ButtonModule, DatePickerModule, IftaLabelModule, SelectModule],
  templateUrl: './entry-form.html',
  styleUrl: './entry-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EntryForm {
  private readonly ref = inject<DynamicDialogRef<EntryForm>>(DynamicDialogRef);

  readonly entry = input<CalendarEntry>();

  protected readonly typeOptions = [DayType.Working, DayType.NonWorking].map((value) => ({
    value,
    label: DAY_TYPE_LABELS[value],
  }));

  protected readonly isEdit = computed(() => !!this.entry());
  protected readonly date = linkedSignal<Date | null>(() => {
    const entry = this.entry();
    return entry ? parseIsoDate(entry.date) : null;
  });
  protected readonly type = linkedSignal<DayType | null>(() => this.entry()?.type ?? DayType.Working);
  protected readonly isValid = computed(() => this.date() !== null && this.type() !== null);

  protected submit(): void {
    const date = this.date();
    const type = this.type();
    if (date === null || type === null) {
      return;
    }
    this.ref.close({ date: toIsoDate(date), type } satisfies CalendarEntry);
  }

  protected cancel(): void {
    this.ref.close();
  }
}
