import { MS_PER_DAY } from '../config/constants';

export function DiffInDaysBetweenDates(inputDate: string) {
  const dateObject = new Date(inputDate);
  const today = new Date();
  return Math.floor(Math.abs(today.valueOf() - dateObject.valueOf()) / MS_PER_DAY);
}
