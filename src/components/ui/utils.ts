import { DASH } from '../constants';

export const getHumanizedDateTime = (dateTime?: string) => {
  if (!dateTime) return DASH;

  const date = new Date(Date.parse(dateTime));
  return date.toLocaleString();
};
