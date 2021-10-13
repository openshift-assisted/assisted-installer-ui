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

const isSNOSupportedVersionString = (version: OpenshiftVersionOptionType['version']) => {
  let parsed = parseFloat(version);
  if (isNaN(parsed)) {
    // openshift-v4.8.0
    parsed = parseFloat(version?.split('-v')?.[1]);
  }
  return parsed >= SNO_SUPPORT_MIN_VERSION;
};

export const isSNOSupportedVersion = (version: OpenshiftVersionOptionType) => {
  // NOTE(jtomasek): Note that the version.value format is different in OCM and ACM
  return isSNOSupportedVersionString(version.version);
};
