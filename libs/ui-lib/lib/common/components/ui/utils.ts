import * as React from 'react';
import { DASH } from '../constants';

export const getHumanizedDateTime = (dateTime?: string) => {
  if (!dateTime) return DASH;
  const date = new Date(dateTime);
  return date.toLocaleString();
};

export const getHumanizedTime = (dateTime?: string) => {
  if (!dateTime) return DASH;
  const date = new Date(dateTime);
  return date.toLocaleTimeString();
};

// TypesScript safe
export const isSelectEventChecked = (
  event: React.MouseEvent | React.ChangeEvent | undefined,
): boolean => {
  const target = event?.target as { checked?: boolean };
  return !!target?.checked;
};
