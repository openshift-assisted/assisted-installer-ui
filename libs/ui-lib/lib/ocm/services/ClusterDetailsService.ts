import {
  AI_UI_TAG,
  Cluster,
  CpuArchitecture,
  InfraEnv,
  ManagedDomain,
  OpenshiftVersionOptionType,
  getClusterDetailsInitialValues,
  ClusterCpuArchitecture,
  PlatformType,
} from '../../common';
import DiskEncryptionService from './DiskEncryptionService';
import {
  ClusterCreateParamsWithStaticNetworking,
  ClusterDetailsUpdateParams,
  HostsNetworkConfigurationType,
  OcmClusterDetailsValues,
} from './types';
import { getDummyInfraEnvField } from '../components/clusterConfiguration/staticIp/data/dummyData';
import { isInOcm } from '../api';
import { getDefaultCpuArchitecture } from './CpuArchitectureService';

const getNewClusterCpuArchitecture = (urlSearchParams: string) => {
  const params = new URLSearchParams(urlSearchParams);
  const hasArmSearchParam = params.get('useArm') === 'true';
  return hasArmSearchParam ? CpuArchitecture.ARM : getDefaultCpuArchitecture();
};

const getExistingClusterCpuArchitecture = (infraEnv: InfraEnv) => {
  return infraEnv.cpuArchitecture || getDefaultCpuArchitecture();
};

const ClusterDetailsService = {
  getClusterCreateParams(values: OcmClusterDetailsValues): ClusterCreateParamsWithStaticNetworking {
    const params: ClusterCreateParamsWithStaticNetworking = {
      name: values.name,
      highAvailabilityMode: values.highAvailabilityMode,
      openshiftVersion: values.openshiftVersion,
      pullSecret: values.pullSecret,
      baseDnsDomain: values.baseDnsDomain,
      cpuArchitecture: values.cpuArchitecture as ClusterCpuArchitecture,
      diskEncryption: DiskEncryptionService.getDiskEncryptionParams(values),
      platform: {
        type: values.platform,
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

    return params;
  },

  getClusterUpdateParams(
    values: OcmClusterDetailsValues,
    platform: PlatformType,
  ): ClusterDetailsUpdateParams {
    const params: ClusterDetailsUpdateParams = {
      name: values.name,
      baseDnsDomain: values.baseDnsDomain,
    };

    if (values.pullSecret) {
      params.pullSecret = values.pullSecret;
    }

    if (platform) {
      params.platform = {
        type: platform,
      };
    }

    return params;
  },

  getClusterDetailsInitialValues({
    cluster,
    infraEnv,
    urlSearchParams,
    ...args
  }: {
    cluster?: Cluster;
    infraEnv?: InfraEnv;
    pullSecret?: string;
    managedDomains: ManagedDomain[];
    ocpVersions: OpenshiftVersionOptionType[];
    urlSearchParams: string;
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

    return {
      ...values,
      cpuArchitecture,
      hostsNetworkConfigurationType,
      addCustomManifest: false,
      isCMNSupported: true,
    };
  },
};

export default ClusterDetailsService;
