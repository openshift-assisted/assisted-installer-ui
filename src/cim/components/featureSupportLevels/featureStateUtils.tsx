import { FeatureId, SupportLevel } from '../../../common/types';
import { Cluster } from '../../../common/api/types';
import { TFunction } from 'i18next';

const clusterExistsReason = 'This option is not editable after the draft cluster is created';

const getSNODisabledReason = (cluster: Cluster | undefined, isSupported: boolean, t: TFunction) => {
  if (cluster) {
    return clusterExistsReason;
  }
  if (!isSupported) {
    return t('ai:Single-Node OpenShift is not supported in this OpenShift version');
  }
  return '';
};

export const getFeatureDisabledReason = (
  featureId: FeatureId,
  cluster: Cluster | undefined,
  isSupported: boolean,
  t: TFunction,
): string | undefined => {
  switch (featureId) {
    case 'SNO': {
      return getSNODisabledReason(cluster, isSupported, t);
    }
    default: {
      return undefined;
    }
  }
};

export const isFeatureSupported = (supportLevel: SupportLevel | undefined) => {
  return supportLevel !== 'unsupported';
};
