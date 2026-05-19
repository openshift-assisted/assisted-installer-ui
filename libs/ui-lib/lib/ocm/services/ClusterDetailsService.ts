import {
  AI_UI_TAG,
  CpuArchitecture,
  OpenshiftVersionOptionType,
  getClusterDetailsInitialValues,
  ClusterCpuArchitecture,
} from '../../common';
import DiskEncryptionService from './DiskEncryptionService';
import {
  ClusterCreateParamsWithStaticNetworking,
  ClusterDetailsUpdateParams,
  HostsNetworkConfigurationType,
  OcmClusterDetailsValues,
} from './types';
import { getDummyInfraEnvField } from '../components/clusterConfiguration/staticIp/data/dummyData';
import { isInOcm } from '../../common/api';
import { getDefaultCpuArchitecture } from './CpuArchitectureService';
import {
  Cluster,
  InfraEnv,
  ManagedDomain,
  PlatformType,
} from '@openshift-assisted/types/assisted-installer-service';
import toNumber from 'lodash-es/toNumber';

const getNewClusterCpuArchitecture = (urlSearchParams: string) => {
  const params = new URLSearchParams(urlSearchParams);
  const hasArmSearchParam = params.get('useArm') === 'true';
  return hasArmSearchParam ? CpuArchitecture.ARM : getDefaultCpuArchitecture();
};

const getExistingClusterCpuArchitecture = (infraEnv: InfraEnv) => {
  return infraEnv.cpuArchitecture || getDefaultCpuArchitecture();
};

const ntpSourceForCluster = (cluster?: Cluster, infraEnv?: InfraEnv): string | undefined => {
  const fromCluster = cluster?.additionalNtpSource?.trim();
  const fromInfra = infraEnv?.additionalNtpSources?.trim();
  const merged = fromCluster || fromInfra;
  return merged || undefined;
};

const ClusterDetailsService = {
  getClusterCreateParams(
    values: OcmClusterDetailsValues,
    infraEnv?: InfraEnv,
  ): ClusterCreateParamsWithStaticNetworking {
    const params: ClusterCreateParamsWithStaticNetworking = {
      name: values.name,
      controlPlaneCount: toNumber(values.controlPlaneCount),
      openshiftVersion: values.openshiftVersion,
      pullSecret: values.pullSecret,
      baseDnsDomain: values.baseDnsDomain,
      cpuArchitecture: values.cpuArchitecture as ClusterCpuArchitecture,
      diskEncryption: DiskEncryptionService.getDiskEncryptionParams(values),
      platform: {
        type: values.platform,
        ...(values.platform === 'external'
          ? {
              external: {
                platformName: 'oci',
                cloudControllerManager: 'External',
              },
            }
          : {}),
      },
    };

    if (!values.isCMNSupported) {
      params.userManagedNetworking = true;
    }

    if (values.hostsNetworkConfigurationType === HostsNetworkConfigurationType.STATIC) {
      params.staticNetworkConfig = getDummyInfraEnvField();
    }

    if (isInOcm) {
      params.tags = AI_UI_TAG;
    }

    if (params.platform?.type === 'none') {
      delete params.platform;
    }

    const ntp = ntpSourceForCluster(undefined, infraEnv);
    if (ntp) {
      params.additionalNtpSource = ntp;
    }

    return params;
  },

  getClusterUpdateParams(
    values: OcmClusterDetailsValues,
    platform: PlatformType,
    cluster?: Cluster,
    infraEnv?: InfraEnv,
  ): ClusterDetailsUpdateParams {
    const params: ClusterDetailsUpdateParams = {
      name: values.name,
      baseDnsDomain: values.baseDnsDomain,
    };

    if (values.pullSecret) {
      params.pullSecret = values.pullSecret;
    }

    if (platform) {
      params.platform =
        platform === 'external'
          ? {
              type: platform,
              external: { platformName: 'oci', cloudControllerManager: 'External' },
            }
          : { type: platform };
    }

    const ntp = ntpSourceForCluster(cluster, infraEnv);
    if (ntp) {
      params.additionalNtpSource = ntp;
    }

    return params;
  },

  getClusterDetailsInitialValues({
    cluster,
    infraEnv,
    urlSearchParams,
    isSingleClusterFeatureEnabled,
    ...args
  }: {
    cluster?: Cluster;
    infraEnv?: InfraEnv;
    pullSecret?: string;
    managedDomains: ManagedDomain[];
    ocpVersions: OpenshiftVersionOptionType[];
    urlSearchParams: string;
    isSingleClusterFeatureEnabled?: boolean;
  }): OcmClusterDetailsValues {
    const values = getClusterDetailsInitialValues({
      cluster,
      ...args,
    });

    const cpuArchitecture = infraEnv
      ? getExistingClusterCpuArchitecture(infraEnv)
      : getNewClusterCpuArchitecture(urlSearchParams);

    const hostsNetworkConfigurationType = infraEnv?.staticNetworkConfig
      ? HostsNetworkConfigurationType.STATIC
      : HostsNetworkConfigurationType.DHCP;

    const platform =
      isSingleClusterFeatureEnabled && !cluster ? ('none' as PlatformType) : values.platform;

    return {
      ...values,
      platform,
      cpuArchitecture,
      hostsNetworkConfigurationType,
      isCMNSupported: true,
      isSNODevPreview: false,
    };
  },
};

export default ClusterDetailsService;
