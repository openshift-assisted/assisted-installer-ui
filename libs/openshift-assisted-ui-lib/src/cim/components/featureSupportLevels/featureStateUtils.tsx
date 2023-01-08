import { FeatureId, OpenshiftVersionOptionType, SupportLevel } from '../../../common/types';
import { TFunction } from 'i18next';

const getClusterExistsReason = (t: TFunction) =>
  t('ai:This option is not editable after the draft cluster is created');

const getSNODisabledReason = (clusterExists: boolean, isSupported: boolean, t: TFunction) => {
  if (clusterExists) {
    return getClusterExistsReason(t);
  }
  if (!isSupported) {
    return t('ai:Single-Node OpenShift is not supported in this OpenShift version');
  }
  return undefined;
};

const getArmDisabledReason = (
  clusterExists: boolean,
  versionName: string,
  versionOptions: OpenshiftVersionOptionType[],
  isSupported: boolean,
  t: TFunction,
) => {
  if (clusterExists) {
    return getClusterExistsReason(t);
  }
  if (!isSupported) {
    return t('ai:arm64 is not supported in this OpenShift version');
  }
  // TODO(jtomasek): versionOptions derived from clusterimagesets need to include cpuArchitectures array to correctly determine this
  // if (!isArmSupportedByTheImage(versionName, versionOptions)) {
  //   return t('ai:Selected image does not support arm64');
  // }
  return undefined;
};

export const getFeatureDisabledReason = (
  featureId: FeatureId,
  clusterExists: boolean,
  versionName: string,
  versionOptions: OpenshiftVersionOptionType[],
  isSupported: boolean,
  t: TFunction,
): string | undefined => {
  switch (featureId) {
    case 'SNO': {
      return getSNODisabledReason(clusterExists, isSupported, t);
    }
    case 'ARM64_ARCHITECTURE': {
      return getArmDisabledReason(clusterExists, versionName, versionOptions, isSupported, t);
    }
    default: {
      return undefined;
    }
  }
};

export const isFeatureSupported = (supportLevel: SupportLevel | undefined) => {
  return supportLevel !== 'unsupported';
};
