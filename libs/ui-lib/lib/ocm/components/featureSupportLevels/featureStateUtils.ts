import {
  ActiveFeatureConfiguration,
  architectureData,
  CpuArchitecture,
  FeatureId,
  isSNO,
  OperatorsValues,
  SupportedCpuArchitecture,
} from '../../../common';
import {
  Cluster,
  PlatformType,
  SupportLevel,
} from '@openshift-assisted/types/assisted-installer-service';
import { ExternalPlatformLabels } from '../clusterConfiguration/platformIntegration/constants';

const CNV_OPERATOR_LABEL = 'Openshift Virtualization';
const LVMS_OPERATOR_LABEL = 'Logical Volume Manager Storage';
const LVM_OPERATOR_LABEL = 'Logical Volume Manager';
const ODF_OPERATOR_LABEL = 'OpenShift Data Foundation';
const OPENSHIFT_AI_OPERATOR_LABEL = 'OpenShift AI';
const MTV_OPERATOR_LABEL = 'Migration Toolkit for Virtualization';
const OSC_OPERATOR_LABEL = 'OpenShift sandboxed containers';

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
    ? `Currently, you cannot install ${CNV_OPERATOR_LABEL} operator at the same time as ${LVM_OPERATOR_LABEL} operator.`
    : undefined;
};

export const getLvmIncompatibleWithCnvReason = (
  operatorValues: OperatorsValues,
  lvmSupport: SupportLevel | undefined,
) => {
  const hasSelectedCnv = operatorValues.useContainerNativeVirtualization;
  // In versions with none or limited support for LVM (< 4.12), it's not possible to select CNV + LVM
  if (hasSelectedCnv && lvmSupport !== 'supported') {
    return `Currently, you cannot install ${LVM_OPERATOR_LABEL} operator at the same time as ${CNV_OPERATOR_LABEL} operator.`;
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
  platformType?: PlatformType,
) => {
  if (!activeFeatureConfiguration) {
    return undefined;
  }
  if (platformType === 'nutanix') {
    return `${CNV_OPERATOR_LABEL} is not available when Nutanix platform type is selected.`;
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
  platformType?: PlatformType,
) => {
  if (!activeFeatureConfiguration) {
    return undefined;
  }
  const operatorLabel = isSupported ? LVMS_OPERATOR_LABEL : LVM_OPERATOR_LABEL;
  if (platformType === 'nutanix') {
    return `${operatorLabel} is not supported when Nutanix platform type is selected.`;
  }
  if (!isSupported) {
    return `${operatorLabel} is not supported in this OpenShift version.`;
  }
  return undefined;
};

const getOscDisabledReason = (
  cluster: Cluster | undefined,
  activeFeatureConfiguration: ActiveFeatureConfiguration | undefined,
  isSupported: boolean,
) => {
  if (!cluster) {
    return undefined;
  }
  if (!isSupported) {
    return `${OSC_OPERATOR_LABEL} is not supported in this OpenShift version.`;
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

const getOciDisabledReason = (cpuArchitecture: string | undefined, isSupported: boolean) => {
  if (!isSupported) {
    if (cpuArchitecture === CpuArchitecture.s390x || cpuArchitecture === CpuArchitecture.ppc64le) {
      return `Integration with Oracle is not available with the selected CPU architecture.`;
    } else {
      return 'Integration with Oracle is available for OpenShift 4.14 and later versions.';
    }
  }
};

export const getNewFeatureDisabledReason = (
  featureId: FeatureId,
  cluster: Cluster | undefined,
  activeFeatureConfiguration: ActiveFeatureConfiguration,
  isSupported: boolean,
  cpuArchitecture?: SupportedCpuArchitecture,
  platformType?: PlatformType,
): string | undefined => {
  switch (featureId) {
    case 'SNO': {
      return getSNODisabledReason(cluster, isSupported);
    }
    case 'ARM64_ARCHITECTURE': {
      return getArmDisabledReason(cluster);
    }
    case 'CNV': {
      return getCnvDisabledReason(
        activeFeatureConfiguration,
        isSupported,
        platformType ?? cluster?.platform?.type,
      );
    }
    case 'LVM': {
      return getLvmDisabledReason(
        activeFeatureConfiguration,
        isSupported,
        platformType ?? cluster?.platform?.type,
      );
    }
    case 'ODF': {
      return getOdfDisabledReason(cluster, activeFeatureConfiguration, isSupported);
    }
    case 'OPENSHIFT_AI': {
      return getOpenShiftAIDisabledReason(cluster, activeFeatureConfiguration, isSupported);
    }
    case 'OSC': {
      return getOscDisabledReason(cluster, activeFeatureConfiguration, isSupported);
    }
    case 'NETWORK_TYPE_SELECTION': {
      return getNetworkTypeSelectionDisabledReason(cluster);
    }
    case 'CLUSTER_MANAGED_NETWORKING': {
      return `Cluster-managed networking is not supported when using ${
        platformType ? ExternalPlatformLabels[platformType] : ''
      }`;
    }
    case 'EXTERNAL_PLATFORM_OCI': {
      return getOciDisabledReason(cpuArchitecture, isSupported);
    }
    case 'MCE': {
      if (platformType === 'nutanix') {
        return 'Multicluster engine is not supported with Nutanix platform type.';
      }
      if (!isSupported) {
        return 'Multicluster engine is not supported in this OpenShift version.';
      }
    }
    case 'NUTANIX_INTEGRATION': {
      if (!isSupported) {
        return `Integration with Nutanix is not available with the selected CPU architecture.`;
      }
    }
    case 'VSPHERE_INTEGRATION': {
      if (!isSupported) {
        return `Integration with vSphere is not available with the selected CPU architecture.`;
      }
    }
    case 'USER_MANAGED_NETWORKING': {
      if (!isSupported) {
        return `User-Managed Networking is not supported when using ${
          platformType ? ExternalPlatformLabels[platformType] : ''
        }`;
      }
    }
    case 'MTV': {
      if (!isSupported) {
        return 'Migration Toolkit for Virtualization is not supported in this OpenShift version';
      }
    }
    case 'AUTHORINO': {
      if (!isSupported) {
        return `Authorino is not available with the selected CPU architecture.`;
      }
    }
    case 'LSO': {
      if (!isSupported) {
        return `Lso is not available with the selected CPU architecture.`;
      }
    }
    case 'NMSTATE': {
      if (!isSupported) {
        return `Nmstate is not available with the selected CPU architecture.`;
      }
    }
    case 'NODE_FEATURE_DISCOVERY': {
      if (!isSupported) {
        return `Node Feature Discovery is not available with the selected CPU architecture.`;
      }
    }
    case 'NVIDIA_GPU': {
      if (!isSupported) {
        return `NVIDIA GPU is not available with the selected CPU architecture.`;
      }
    }
    case 'PIPELINES': {
      if (!isSupported) {
        return `Pipelines is not available with the selected CPU architecture.`;
      }
    }
    case 'SERVERLESS': {
      if (!isSupported) {
        return `Serverless is not available with the selected CPU architecture.`;
      }
    }
    case 'SERVICEMESH': {
      if (!isSupported) {
        return `Service mesh is not available with the selected CPU architecture.`;
      }
    }
    case 'AMD_GPU': {
      if (!isSupported) {
        return `AMD GPU is not available with the selected CPU architecture.`;
      }
    }
    default: {
      return undefined;
    }
  }
};

export const isFeatureSupportedAndAvailable = (supportLevel: SupportLevel | undefined): boolean => {
  return supportLevel !== 'unsupported' && supportLevel !== 'unavailable';
};

export const hostsNetworkConfigurationDisabledReason =
  "DHCP only is the supported hosts' network configuration when external partner integrations is selected";

export const getOdfIncompatibleWithLvmsReason = (operatorValues: OperatorsValues) => {
  const mustDisableOdf = operatorValues.useOdfLogicalVolumeManager;
  // In versions >= 4.15, it's not possible to select ODF + LVMS
  return mustDisableOdf
    ? `Currently, you cannot install ${ODF_OPERATOR_LABEL} operator at the same time as ${LVMS_OPERATOR_LABEL} operator.`
    : undefined;
};

export const getOpenShiftAIIncompatibleWithLvmsReason = (operatorValues: OperatorsValues) => {
  // Currently OpenShift AI requires ODF, and that is incompatible with LVM.
  const mustDisableOpenShiftAI = operatorValues.useOdfLogicalVolumeManager;
  return mustDisableOpenShiftAI
    ? `Currently the ${OPENSHIFT_AI_OPERATOR_LABEL} requires ${ODF_OPERATOR_LABEL}, and you cannot install that at the same time as ${LVMS_OPERATOR_LABEL} operator.`
    : undefined;
};

export const getLvmsIncompatibleWithOdfReason = (operatorValues: OperatorsValues) => {
  const mustDisableLvms = operatorValues.useOpenShiftDataFoundation;
  // In versions >= 4.15, it's not possible to select ODF + LVMS
  return mustDisableLvms
    ? `Currently, you cannot install ${LVMS_OPERATOR_LABEL} operator at the same time as ${ODF_OPERATOR_LABEL} operator.`
    : undefined;
};

const getOpenShiftAIDisabledReason = (
  cluster: Cluster | undefined,
  activeFeatureConfiguration: ActiveFeatureConfiguration | undefined,
  isSupported: boolean,
) => {
  if (!cluster) {
    return undefined;
  }

  const isArm = activeFeatureConfiguration?.underlyingCpuArchitecture === CpuArchitecture.ARM;
  if (isArm) {
    return `${OPENSHIFT_AI_OPERATOR_LABEL} is not available when ARM CPU architecture is selected.`;
  }
  if (isSNO(cluster)) {
    return `${OPENSHIFT_AI_OPERATOR_LABEL} is not available when deploying a Single Node OpenShift.`;
  }
  if (!isSupported) {
    return `The installer cannot currently enable ${OPENSHIFT_AI_OPERATOR_LABEL} with the selected OpenShift version, but it can be enabled later through the OpenShift Console once the installation is complete.`;
  }
  return undefined;
};

export const getCnvDisabledWithMtvReason = (operatorValues: OperatorsValues) => {
  const mustDisableCnv =
    operatorValues.useContainerNativeVirtualization &&
    !operatorValues.useMigrationToolkitforVirtualization;
  return mustDisableCnv
    ? `Currently, you need to install ${CNV_OPERATOR_LABEL} operator at the same time as ${MTV_OPERATOR_LABEL} operator.`
    : undefined;
};
