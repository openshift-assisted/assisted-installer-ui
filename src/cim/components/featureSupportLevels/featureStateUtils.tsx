import { FeatureId, SupportLevel } from '../../../common/types';
import { Cluster } from '../../../common/api/types';

const clusterExistsReason = 'This option is not editable after the draft cluster is created';

const getSNODisabledReason = (cluster: Cluster | undefined, isSupported: boolean) => {
  if (cluster) {
    return clusterExistsReason;
  }
  if (!isSupported) {
    return 'Single-Node OpenShift is not supported in this OpenShift version';
  }
  return '';
};

export const getFeatureDisabledReason = (
  featureId: FeatureId,
  cluster: Cluster | undefined,
  isSupported: boolean,
): string | undefined => {
  switch (featureId) {
    case 'SNO': {
      return getSNODisabledReason(cluster, isSupported);
    }
    default: {
      return undefined;
    }
  }
};

export const isFeatureSupported = (supportLevel: SupportLevel | undefined) => {
  return supportLevel !== 'unsupported';
};
