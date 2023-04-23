import {
  ActiveFeatureConfiguration,
  Cluster,
  CpuArchitecture,
  FeatureId,
  isSNO,
  OperatorsValues,
  SupportLevel,
  SupportedCpuArchitecture,
} from '../../../common';
import { architectureData } from '../clusterConfiguration/CpuArchitectureDropdown';

const CNV_OPERATOR_LABEL = 'Openshift Virtualization';
const LVMS_OPERATOR_LABEL = 'Logical Volume Manager Storage';
const LVM_OPERATOR_LABEL = 'Logical Volume Manager';
const ODF_OPERATOR_LABEL = 'OpenShift Data Foundation';

export const clusterExistsReason = 'This option is not editable after the draft cluster is created';

export const getCnvIncompatibleWithLvmReason = (
  operatorValues: OperatorsValues,
  lvmSupport: SupportLevel | undefined,
) => {
  const mustDisableCnv =
    !operatorValues.useContainerNativeVirtualization &&
    operatorValues.useOdfLogicalVolumeManager &&
    lvmSupport !== 'supported';
  // In versions with none or limited support for LVM (< 4.12), it's not possible to select CNV + LVM
  return mustDisableCnv
    ? `Currently, you can not install ${CNV_OPERATOR_LABEL} operator at the same time as ${LVM_OPERATOR_LABEL} operator.`
    : undefined;
};

export const getLvmIncompatibleWithCnvReason = (
  operatorValues: OperatorsValues,
  lvmSupport: SupportLevel | undefined,
) => {
  const hasSelectedCnv = operatorValues.useContainerNativeVirtualization;
  const hasSelectedLVMS = operatorValues.useOdfLogicalVolumeManager;
  // In versions which support for LVMS (4.12+), LVMS needs to be installed together with CNV
  if (hasSelectedCnv && hasSelectedLVMS) {
    return `${LVMS_OPERATOR_LABEL} must be installed when ${CNV_OPERATOR_LABEL} operator is also installed`;
  }
  // In versions with none or limited support for LVM (< 4.12), it's not possible to select CNV + LVM
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

const getArmDisabledReason = (cluster: Cluster | undefined) => {
  if (cluster) {
    return clusterExistsReason;
  } else return 'arm64 is not supported in this OpenShift version';
};

const getOdfDisabledReason = (
  cluster: Cluster | undefined,
  activeFeatureConfiguration: ActiveFeatureConfiguration | undefined,
  isSupported: boolean,
) => {
  if (!cluster) {
    return undefined;
  }

  const isArm = activeFeatureConfiguration?.underlyingCpuArchitecture === CpuArchitecture.ARM;
  if (isArm && isSNO(cluster)) {
    return `${ODF_OPERATOR_LABEL} is not available when using Single Node OpenShift or ARM CPU architecture.`;
  }
  if (isArm) {
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

const getCnvDisabledReason = (
  activeFeatureConfiguration: ActiveFeatureConfiguration,
  isSupported: boolean,
) => {
  if (!activeFeatureConfiguration) {
    return undefined;
  }
  if (!isSupported) {
    const cpuArchitectureLabel =
      architectureData[
        activeFeatureConfiguration.underlyingCpuArchitecture as SupportedCpuArchitecture
      ].label;
    return `${CNV_OPERATOR_LABEL} is not available when ${
      cpuArchitectureLabel
        ? cpuArchitectureLabel
        : activeFeatureConfiguration.underlyingCpuArchitecture
    } CPU architecture is selected.`;
  } else {
    return undefined;
  }
};

const getLvmDisabledReason = (
  activeFeatureConfiguration: ActiveFeatureConfiguration,
  isSupported: boolean,
) => {
  if (!activeFeatureConfiguration) {
    return undefined;
  }
  const operatorLabel = isSupported ? LVMS_OPERATOR_LABEL : LVM_OPERATOR_LABEL;
  if (!isSupported) {
    return `${operatorLabel} is not supported in this OpenShift version.`;
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

export const getNewFeatureDisabledReason = (
  featureId: FeatureId,
  cluster: Cluster | undefined,
  activeFeatureConfiguration: ActiveFeatureConfiguration,
  isSupported: boolean,
): string | undefined => {
  switch (featureId) {
    case 'SNO': {
      return getSNODisabledReason(cluster, isSupported);
    }
    case 'ARM64_ARCHITECTURE': {
      return getArmDisabledReason(cluster);
    }
    case 'CNV': {
      return getCnvDisabledReason(activeFeatureConfiguration, isSupported);
    }
    case 'LVM': {
      return getLvmDisabledReason(activeFeatureConfiguration, isSupported);
    }
    case 'ODF': {
      return getOdfDisabledReason(cluster, activeFeatureConfiguration, isSupported);
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

export const isFeatureSupportedAndAvailable = (supportLevel: SupportLevel | undefined): boolean => {
  return supportLevel !== 'unsupported' && supportLevel !== 'unavailable';
};
