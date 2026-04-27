import * as React from 'react';
import { DASH } from '../constants';
import { OpenshiftVersionOptionType } from '../../types';
import { TFunction } from 'i18next';

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

export const getVersionLabel = (version: OpenshiftVersionOptionType, t: TFunction) =>
  version.supportLevel === 'beta'
    ? version.label + ' - ' + t('ai:Developer preview release')
    : version.label;
