import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CalendarPage } from './calendar/calendar-page/calendar-page';

@Component({
  selector: 'app-root',
  imports: [CalendarPage],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {}
