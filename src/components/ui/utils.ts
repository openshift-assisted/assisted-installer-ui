import { DASH } from '../constants';

export const getHumanizedDateTime = (dateTime?: string) => {
  if (!dateTime) return DASH;
  // NOTE(jtomasek): server does not return ISO-8601 formatted date, therefore we need to adjust it
  const date = new Date(`${dateTime}Z`);
  return date.toLocaleString();
};
