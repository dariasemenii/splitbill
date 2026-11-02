import { ApiError } from './api';

const messages: Record<string, string> = {
  OTP_COOLDOWN: 'Зачекайте хвилину перед повторним запитом коду',
  INVALID_CODE: 'Код невірний або вже не дійсний',
  VALIDATION_ERROR: 'Перевірте введені дані',
  SESSION_EXPIRED: 'Сесія завершилась, увійдіть знову',
  GROUP_NOT_FOUND: 'Групу не знайдено',
};

// Зрозуміле повідомлення для користувача з будь-якої помилки
export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return messages[error.code] ?? (error.status >= 500 ? 'Помилка сервера, спробуйте пізніше' : 'Щось пішло не так');
  }
  if (error instanceof TypeError) {
    // fetch кидає TypeError, коли немає з'єднання
    return "Не вдалося з'єднатися з сервером. Перевірте інтернет";
  }
  return 'Щось пішло не так';
}
