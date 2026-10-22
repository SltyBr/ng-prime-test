import { Translation } from 'primeng/api';

import {
  DAY_NAMES,
  DAY_NAMES_SHORT,
  MONTH_NAMES,
  MONTH_NAMES_SHORT,
  PRIMENG_DATE_FORMAT,
} from './shared/constants/date-constants';

export const PRIMENG_RU: Translation = {
  dayNames: [...DAY_NAMES],
  dayNamesShort: [...DAY_NAMES_SHORT],
  dayNamesMin: [...DAY_NAMES_SHORT],
  monthNames: [...MONTH_NAMES],
  monthNamesShort: [...MONTH_NAMES_SHORT],
  firstDayOfWeek: 1,
  dateFormat: PRIMENG_DATE_FORMAT,
  today: 'Сегодня',
  clear: 'Очистить',
  emptyMessage: 'Нет записей',
};
