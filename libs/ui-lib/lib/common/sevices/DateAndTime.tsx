import { TIME_ZERO, MS_PER_DAY } from '../config/constants';

export function diffInDaysBetweenDates(inputDate: string) {
  const dateObject = new Date(inputDate);
  const today = new Date();
  return Math.floor(Math.abs(today.valueOf() - dateObject.valueOf()) / MS_PER_DAY);
}

export function calculateClusterDateDiff(inactiveDeletionDays: number, completedAt?: string) {
  if (completedAt && completedAt !== TIME_ZERO) {
    return inactiveDeletionDays - diffInDaysBetweenDates(completedAt);
  } else {
    return inactiveDeletionDays;
  }
}
