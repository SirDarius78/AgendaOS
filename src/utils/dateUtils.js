import {
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameDay,
  addWeeks,
  subWeeks,
  parseISO,
  isValid,
} from "date-fns";
import { es } from "date-fns/locale";

export const getWeekDays = (date) => {
  const start = startOfWeek(date, { weekStartsOn: 1 });
  const end = endOfWeek(date, { weekStartsOn: 1 });
  return eachDayOfInterval({ start, end });
};

export const formatDate = (date, fmt = "yyyy-MM-dd") =>
  format(date, fmt, { locale: es });

export const formatDisplay = (date, fmt = "d MMM") =>
  format(date, fmt, { locale: es });

export const formatLong = (date) =>
  format(date, "EEEE, d 'de' MMMM yyyy", { locale: es });

export const isSame = (a, b) => isSameDay(a, b);

export const nextWeek = (date) => addWeeks(date, 1);
export const prevWeek = (date) => subWeeks(date, 1);

export const parseDate = (str) => {
  if (!str) return null;
  const d = parseISO(str);
  return isValid(d) ? d : null;
};

export const HOURS = Array.from({ length: 15 }, (_, i) => i + 7); // 7am–9pm
