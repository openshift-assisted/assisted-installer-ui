import { FeatureId, OpenshiftVersionOptionType, SupportLevel } from '../../../common/types';
import { Cluster, CpuArchitecture } from '../../../common/api/types';
import { isArmArchitecture, isSNO } from '../../../common/selectors/clusterSelectors';

const isArmSupported = (versionName: string, versionOptions: OpenshiftVersionOptionType[]) => {
  const versionOption = versionOptions.find((option) => option.value === versionName);
  return !!versionOption?.cpuArchitectures?.includes(CpuArchitecture.ARM);
};
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

const getArmDisabledReason = (
  cluster: Cluster | undefined,
  versionName: string,
  versionOptions: OpenshiftVersionOptionType[],
) => {
  if (cluster) {
    return clusterExistsReason;
  }
  if (!isArmSupported(versionName, versionOptions)) {
    return 'arm64 is not supported in this OpenShift version';
  }
  return undefined;
};

const getOdfDisabledReason = (cluster: Cluster | undefined) => {
  if (!cluster) {
    return undefined;
  }
  if (isArmArchitecture(cluster)) {
    return 'OpenShift Container Storage is not supported for ARM architecture';
  }
  return undefined;
};

const getCnvDisabledReason = (cluster: Cluster | undefined) => {
  if (!cluster) {
    return undefined;
  }
  if (isArmArchitecture(cluster)) {
    return 'OpenShift Virtualization is not supported for ARM architecture';
  }
  return undefined;
};

const getNetworkTypeSelectionDisabledReason = (cluster: Cluster | undefined) => {
  if (!cluster) {
    return undefined;
  }
  if (isArmArchitecture(cluster)) {
    return 'Network type selection is not supported for ARM architecture';
  }
  if (isSNO(cluster)) {
    return 'Network type selection is not supported for Single-Node OpenShift';
  }
  return undefined;
};

export const getFeatureDisabledReason = (
  featureId: FeatureId,
  cluster: Cluster | undefined,
  versionName: string,
  versionOptions: OpenshiftVersionOptionType[],
  isSupported: boolean,
): string | undefined => {
  switch (featureId) {
    case 'SNO': {
      return getSNODisabledReason(cluster, isSupported);
    }
    case 'ARM64_ARCHITECTURE': {
      return getArmDisabledReason(cluster, versionName, versionOptions);
    }
    case 'CNV': {
      return getCnvDisabledReason(cluster);
    }
    case 'ODF': {
      return getOdfDisabledReason(cluster);
    }
    case 'NETWORK_TYPE_SELECTION': {
      return getNetworkTypeSelectionDisabledReason(cluster);
    }
    default: {
      return undefined;
    }
  }
};

export const isFeatureSupported = (
  versionName: string,
  featureId: FeatureId,
  supportLevel: SupportLevel | undefined,
  versionOptions: OpenshiftVersionOptionType[],
) => {
  if (featureId === 'ARM64_ARCHITECTURE') {
    return isArmSupported(versionName, versionOptions);
  } else {
    return supportLevel !== 'unsupported';
  }
};
