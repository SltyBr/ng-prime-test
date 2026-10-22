import { Translation } from 'primeng/api';

import { MONTH_NAMES } from './shared/constants/date-constants';

export const PRIMENG_RU: Translation = {
  dayNames: ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'],
  dayNamesShort: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
  dayNamesMin: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
  monthNames: [...MONTH_NAMES],
  monthNamesShort: [
    'Янв',
    'Фев',
    'Мар',
    'Апр',
    'Май',
    'Июн',
    'Июл',
    'Авг',
    'Сен',
    'Окт',
    'Ноя',
    'Дек',
  ],
  firstDayOfWeek: 1,
  dateFormat: 'dd.mm.yy',
  today: 'Сегодня',
  clear: 'Очистить',
  emptyMessage: 'Нет записей',
};
