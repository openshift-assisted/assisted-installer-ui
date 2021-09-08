import { SNO_SUPPORT_MIN_VERSION } from '../../config';
import { OpenshiftVersionOptionType } from '../../types';
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

export const isSNOSupportedVersion = (version: OpenshiftVersionOptionType) => {
  const parsed = parseFloat(version.value);
  if (isNaN(parsed)) {
    // openshift-v4.8.0
    return parseFloat(version.value?.split('-v')?.[1]) >= SNO_SUPPORT_MIN_VERSION;
  }
  return parsed >= SNO_SUPPORT_MIN_VERSION;
};
