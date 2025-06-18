import {
  ActiveFeatureConfiguration,
  architectureData,
  CpuArchitecture,
  FeatureId,
  isSNO,
  OPERATOR_NAME_CNV,
  OPERATOR_NAME_LVM,
  OPERATOR_NAME_ODF,
  OPERATOR_NAME_OPENSHIFT_AI,
  OPERATOR_NAME_OSC,
  SupportedCpuArchitecture,
} from '../../../common';
import {
  Cluster,
  PlatformType,
  SupportLevel,
} from '@openshift-assisted/types/assisted-installer-service';
import { ExternalPlatformLabels } from '../clusterConfiguration/platformIntegration/constants';
import { getOperatorSpecByKey } from '../../../common/components/operators/operatorSpecs';
import { GetFeatureSupportLevel } from '../../../common/components/newFeatureSupportLevels';

export const clusterExistsReason = 'This option is not editable after the draft cluster is created';

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
  getFeatureSupportLevel: GetFeatureSupportLevel,
  useLVMS?: boolean,
) => {
  if (!cluster) {
    return undefined;
  }

  const opSpec = getOperatorSpecByKey(OPERATOR_NAME_ODF, getFeatureSupportLevel, useLVMS);

  const operatorTitle = opSpec?.title || '';

  const isArm = activeFeatureConfiguration?.underlyingCpuArchitecture === CpuArchitecture.ARM;
  if (isArm && isSNO(cluster)) {
    return `${operatorTitle} is not available when using Single Node OpenShift or ARM CPU architecture.`;
  }
  if (isArm) {
    return `${operatorTitle} is not available when ARM CPU architecture is selected.`;
  }
  if (isSNO(cluster)) {
    return `${operatorTitle} is not available when deploying a Single Node OpenShift.`;
  }
  if (!isSupported) {
    return `The installer cannot currently enable ${operatorTitle} with the selected OpenShift version, but it can be enabled later through the OpenShift Console once the installation is complete.`;
  }
  return undefined;
};

const getCnvDisabledReason = (
  activeFeatureConfiguration: ActiveFeatureConfiguration,
  isSupported: boolean,
  getFeatureSupportLevel: GetFeatureSupportLevel,
  platformType?: PlatformType,
  useLVMS?: boolean,
) => {
  if (!activeFeatureConfiguration) {
    return undefined;
  }

  const opSpec = getOperatorSpecByKey(OPERATOR_NAME_CNV, getFeatureSupportLevel, useLVMS);
  const operatorTitle = opSpec?.title || '';
  if (platformType === 'nutanix') {
    return `${operatorTitle} is not available when Nutanix platform type is selected.`;
  }
  if (!isSupported) {
    const cpuArchitectureLabel =
      architectureData[
        activeFeatureConfiguration.underlyingCpuArchitecture as SupportedCpuArchitecture
      ].label;

    return `${operatorTitle} is not available when ${
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
  getFeatureSupportLevel: GetFeatureSupportLevel,
  platformType?: PlatformType,
  useLVMS?: boolean,
) => {
  if (!activeFeatureConfiguration) {
    return undefined;
  }

  const opSpec = getOperatorSpecByKey(OPERATOR_NAME_LVM, getFeatureSupportLevel, useLVMS);
  const operatorTitle = opSpec?.title || '';
  if (platformType === 'nutanix') {
    return `${operatorTitle} is not supported when Nutanix platform type is selected.`;
  }
  if (!isSupported) {
    return `${operatorTitle} is not supported in this OpenShift version.`;
  }
  return undefined;
};

const getOscDisabledReason = (
  cluster: Cluster | undefined,
  isSupported: boolean,
  getFeatureSupportLevel: GetFeatureSupportLevel,
  useLVMS?: boolean,
) => {
  if (!cluster) {
    return undefined;
  }

  const opSpec = getOperatorSpecByKey(OPERATOR_NAME_OSC, getFeatureSupportLevel, useLVMS);
  const operatorTitle = opSpec?.title || '';
  if (!isSupported) {
    return `${operatorTitle} is not supported in this OpenShift version.`;
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
  getFeatureSupportLevel?: GetFeatureSupportLevel,
  useLVMS?: boolean,
): string | undefined => {
  switch (featureId) {
    case 'SNO': {
      return getSNODisabledReason(cluster, isSupported);
    }
    case 'ARM64_ARCHITECTURE': {
      return getArmDisabledReason(cluster);
    }
    case 'CNV': {
      if (!getFeatureSupportLevel) {
        throw new Error('getFeatureSupportLevel is required for getCnvDisabledReason');
      }
      return getCnvDisabledReason(
        activeFeatureConfiguration,
        isSupported,
        getFeatureSupportLevel,
        platformType ?? cluster?.platform?.type,
        useLVMS,
      );
    }
    case 'LVM': {
      if (!getFeatureSupportLevel) {
        throw new Error('getFeatureSupportLevel is required for getLvmDisabledReason');
      }
      return getLvmDisabledReason(
        activeFeatureConfiguration,
        isSupported,
        getFeatureSupportLevel,
        platformType ?? cluster?.platform?.type,
        useLVMS,
      );
    }
    case 'ODF': {
      if (!getFeatureSupportLevel) {
        throw new Error('getFeatureSupportLevel is required for getOdfDisabledReason');
      }
      return getOdfDisabledReason(
        cluster,
        activeFeatureConfiguration,
        isSupported,
        getFeatureSupportLevel,
        useLVMS,
      );
    }
    case 'OPENSHIFT_AI': {
      if (!getFeatureSupportLevel) {
        throw new Error('getFeatureSupportLevel is required for getOpenShiftAIDisabledReason');
      }
      return getOpenShiftAIDisabledReason(
        cluster,
        activeFeatureConfiguration,
        isSupported,
        getFeatureSupportLevel,
        useLVMS,
      );
    }
    case 'OSC': {
      if (!getFeatureSupportLevel) {
        throw new Error('getFeatureSupportLevel is required for getOscDisabledReason');
      }
      return getOscDisabledReason(cluster, isSupported, getFeatureSupportLevel, useLVMS);
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

const getOpenShiftAIDisabledReason = (
  cluster: Cluster | undefined,
  activeFeatureConfiguration: ActiveFeatureConfiguration | undefined,
  isSupported: boolean,
  getFeatureSupportLevel: GetFeatureSupportLevel,
  useLVMS?: boolean,
) => {
  if (!cluster) {
    return undefined;
  }

  const opSpec = getOperatorSpecByKey(OPERATOR_NAME_OPENSHIFT_AI, getFeatureSupportLevel, useLVMS);
  const operatorTitle = opSpec?.title || '';
  const isArm = activeFeatureConfiguration?.underlyingCpuArchitecture === CpuArchitecture.ARM;
  if (isArm) {
    return `${operatorTitle} is not available when ARM CPU architecture is selected.`;
  }
  if (isSNO(cluster)) {
    return `${operatorTitle} is not available when deploying a Single Node OpenShift.`;
  }
  if (!isSupported) {
    return `The installer cannot currently enable ${operatorTitle} with the selected OpenShift version, but it can be enabled later through the OpenShift Console once the installation is complete.`;
  }
  return undefined;
};
