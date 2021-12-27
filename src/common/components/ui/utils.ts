import { OpenshiftVersionOptionType } from '../../types';
import { DASH } from '../constants';
import { FeatureSupportLevelData } from '../featureSupportLevels/FeatureSupportLevelContext';

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

export const isSNOSupportedVersion = (
  featureSupportlevels: FeatureSupportLevelData,
  version: OpenshiftVersionOptionType,
) => {
  return featureSupportlevels.getFeatureSupportLevel(version.value, 'SNO') !== 'unsupported';
};
