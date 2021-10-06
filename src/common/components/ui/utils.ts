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

export const isSNOSupportedVersionValue = (versionValue: string) => {
  const parsed = parseFloat(versionValue);
  if (isNaN(parsed)) {
    // openshift-v4.8.0
    return parseFloat(versionValue?.split('-v')?.[1]) >= SNO_SUPPORT_MIN_VERSION;
  }
  return parsed >= SNO_SUPPORT_MIN_VERSION;
};

export const isSNOSupportedVersion = (version: OpenshiftVersionOptionType) => {
  return isSNOSupportedVersionValue(version.version || version.value);
};
