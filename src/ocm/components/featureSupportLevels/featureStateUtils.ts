import {
  Cluster,
  CpuArchitecture,
  FeatureId,
  isArmArchitecture,
  isSNO,
  OpenshiftVersionOptionType,
  OPERATOR_NAME_CNV,
  OPERATOR_NAME_LVM,
  OperatorsValues,
  SupportLevel,
} from '../../../common';

const CNV_OPERATOR_LABEL = 'Virtualization';
const LVM_OPERATOR_LABEL = 'OpenShift Data Foundation Logical Volume Manager';

const isArmSupported = (versionName: string, versionOptions: OpenshiftVersionOptionType[]) => {
  const versionOption = versionOptions.find((option) => option.value === versionName);
  return !!versionOption?.cpuArchitectures?.includes(CpuArchitecture.ARM);
};
const clusterExistsReason = 'This option is not editable after the draft cluster is created';

export const getCnvAndLvmIncompatibilityReason = (
  operatorValues: OperatorsValues,
  versionName: string | undefined,
  testOperator: typeof OPERATOR_NAME_LVM | typeof OPERATOR_NAME_CNV,
) => {
  const hasIncompatibleOperator =
    testOperator === OPERATOR_NAME_CNV
      ? operatorValues.useOdfLogicalVolumeManager
      : operatorValues.useContainerNativeVirtualization;

  if (!hasIncompatibleOperator) {
    return undefined;
  }
  if (testOperator === OPERATOR_NAME_CNV && operatorValues.useContainerNativeVirtualization) {
    // If both are enabled, CNV automatically installs LVM. Allow deactivating CNV
    return undefined;
  }

  const firstOperator =
    testOperator === OPERATOR_NAME_CNV ? CNV_OPERATOR_LABEL : LVM_OPERATOR_LABEL;
  const secondOperator =
    testOperator === OPERATOR_NAME_CNV ? LVM_OPERATOR_LABEL : CNV_OPERATOR_LABEL;

  return `Currently, you can not install ${firstOperator} operator at the same time as ${secondOperator} operator.`;
};

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

const getOdfDisabledReason = (cluster: Cluster | undefined, isSupported: boolean) => {
  if (!cluster) {
    return undefined;
  }
  if (isArmArchitecture(cluster) && isSNO(cluster)) {
    return 'OpenShift Data Foundation is not available when using Single Node OpenShift or ARM CPU architecture.';
  }
  if (isArmArchitecture(cluster)) {
    return 'OpenShift Data Foundation is not available when ARM CPU architecture is selected.';
  }
  if (isSNO(cluster)) {
    return 'OpenShift Data Foundation is not available when deploying a Single Node OpenShift.';
  }
  if (!isSupported) {
    return 'The installer cannot currently enable OpenShift Data Foundation with the selected OpenShift version, but it can be enabled later through the OpenShift Console once the installation is complete.';
  }
  return undefined;
};

const getLvmDisabledReason = (cluster: Cluster | undefined, isSupported: boolean) => {
  if (!cluster) {
    return undefined;
  }
  if (!isSupported) {
    return 'The installer cannot currently enable OpenShift Data Foundation Logical Volume Manager with the selected OpenShift version.';
  }
  return undefined;
};

const getCnvDisabledReason = (cluster: Cluster | undefined) => {
  if (!cluster) {
    return undefined;
  }
  if (isArmArchitecture(cluster)) {
    return 'OpenShift Virtualization is not available when ARM CPU architecture is selected.';
  }
  return undefined;
};

const getNetworkTypeSelectionDisabledReason = (cluster: Cluster | undefined) => {
  if (!cluster) {
    return undefined;
  }
  if (isSNO(cluster)) {
    return 'Network management selection is not supported for Single-Node OpenShift';
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
      return getOdfDisabledReason(cluster, isSupported);
    }
    case 'LVM': {
      return getLvmDisabledReason(cluster, isSupported);
    }
    case 'NETWORK_TYPE_SELECTION': {
      return getNetworkTypeSelectionDisabledReason(cluster);
    }
    case 'ARM64_ARCHITECTURE_WITH_CLUSTER_MANAGED_NETWORKING': {
      return 'Network management selection is not supported for ARM architecture with this version of OpenShift.';
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
