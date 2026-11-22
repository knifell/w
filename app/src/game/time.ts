// Номер текущего дня по локальной дате. Время берётся из защищённых часов игры.
import { nowMs } from './clock';

export const today = (now = new Date(nowMs())) =>
  Math.floor((now.getTime() - now.getTimezoneOffset() * 60000) / 86400000);
