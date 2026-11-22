// Номер текущего дня по локальной дате. На этапе 4 «сегодня» будет приходить с сервера.
export const today = (now = new Date()) =>
  Math.floor((now.getTime() - now.getTimezoneOffset() * 60000) / 86400000);
