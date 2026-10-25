export const STANDARD_WEEKEND_DAYS: readonly number[] = [0, 6];

export const CALENDAR_TEXTS = {
  createTitle: 'Добавить запись',
  editTitle: 'Изменить запись',
  removeTitle: 'Удалить запись',
  duplicateTitle: 'Запись уже существует',
  removeAccept: 'Удалить',
  duplicateAccept: 'Редактировать',
  cancel: 'Отмена',
  reload: 'Повторить',
  errorSummary: 'Ошибка',
  saveError: 'Не удалось сохранить запись',
  removeError: 'Не удалось удалить запись',
  yearsLoadError: 'Список лет не прогрузился',
  entriesLoadError: (year: number) => `Не удалось загрузить записи за ${year} год`,
  today: (date: string) => `Сегодня ${date}`,
  removeConfirm: (date: string, type: string) => `Удалить запись ${date} («${type}»)?`,
  duplicateConfirm: (date: string, existingType: string, newType: string | null) =>
    `На ${date} уже есть запись: «${existingType}».` +
    (newType ? ` Изменить тип на «${newType}»?` : ''),
} as const;
