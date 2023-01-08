import {
  Cluster,
  CpuArchitecture,
  FeatureId,
  isArmArchitecture,
  isSNO,
  OpenshiftVersionOptionType,
  OperatorsValues,
  SupportLevel,
} from '../../../common';

const CNV_OPERATOR_LABEL = 'Openshift Virtualization';
const LVM_OPERATOR_LABEL = 'Logical Volume Manager Storage';
const ODF_OPERATOR_LABEL = 'OpenShift Data Foundation';

const isArmSupported = (versionName: string, versionOptions: OpenshiftVersionOptionType[]) => {
  const versionOption = versionOptions.find((option) => option.value === versionName);
  return !!versionOption?.cpuArchitectures?.includes(CpuArchitecture.ARM);
};
export const clusterExistsReason = 'This option is not editable after the draft cluster is created';

export const getCnvIncompatibleWithLvmReason = (
  operatorValues: OperatorsValues,
  versionName: string | undefined,
  lvmSupport: SupportLevel | undefined,
) => {
  const mustDisableCnv =
    !operatorValues.useContainerNativeVirtualization &&
    operatorValues.useOdfLogicalVolumeManager &&
    lvmSupport !== 'supported';
  // In versions with none or limited support for LVM (< 4.12), it's no possible to select CNV + LVM
  return mustDisableCnv
    ? `Currently, you can not install ${CNV_OPERATOR_LABEL} operator at the same time as ${LVM_OPERATOR_LABEL} operator.`
    : undefined;
};

export const getLvmIncompatibleWithCnvReason = (
  operatorValues: OperatorsValues,
  versionName: string | undefined,
  lvmSupport: SupportLevel | undefined,
) => {
  const hasSelectedCnv = operatorValues.useContainerNativeVirtualization;
  if (hasSelectedCnv && operatorValues.useOdfLogicalVolumeManager) {
    return `${LVM_OPERATOR_LABEL} must be installed when ${CNV_OPERATOR_LABEL} operator is also installed`;
  }
  if (hasSelectedCnv && lvmSupport !== 'supported') {
    return `Currently, you can not install ${LVM_OPERATOR_LABEL} operator at the same time as ${CNV_OPERATOR_LABEL} operator.`;
  }
  return undefined;
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
    return `${ODF_OPERATOR_LABEL} is not available when using Single Node OpenShift or ARM CPU architecture.`;
  }
  if (isArmArchitecture(cluster)) {
    return `${ODF_OPERATOR_LABEL} is not available when ARM CPU architecture is selected.`;
  }
  if (isSNO(cluster)) {
    return `${ODF_OPERATOR_LABEL} is not available when deploying a Single Node OpenShift.`;
  }
  if (!isSupported) {
    return `The installer cannot currently enable ${ODF_OPERATOR_LABEL} with the selected OpenShift version, but it can be enabled later through the OpenShift Console once the installation is complete.`;
  }
  return undefined;
};

const getLvmDisabledReason = (cluster: Cluster | undefined, isSupported: boolean) => {
  if (!cluster) {
    return undefined;
  }
  if (!isSupported) {
    return `${LVM_OPERATOR_LABEL} is enabled only for OpenShift 4.11 and above.`;
  }
  return undefined;
};

const getCnvDisabledReason = (cluster: Cluster | undefined) => {
  if (!cluster) {
    return undefined;
  }
  if (isArmArchitecture(cluster)) {
    return `${CNV_OPERATOR_LABEL} is not available when ARM CPU architecture is selected.`;
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
