import {
  AI_UI_TAG,
  Cluster,
  CpuArchitecture,
  InfraEnv,
  ManagedDomain,
  OpenshiftVersionOptionType,
  getClusterDetailsInitialValues,
  isArmArchitecture,
} from '../../common';
import DiskEncryptionService from './DiskEncryptionService';
import {
  ClusterCreateParamsWithStaticNetworking,
  ClusterDetailsUpdateParams,
  HostsNetworkConfigurationType,
  OcmClusterDetailsValues,
} from './types';
import { getDummyInfraEnvField } from '../components/clusterConfiguration/staticIp/data/dummyData';
import { ocmClient } from '../api';

const getNewClusterCpuArchitecture = (urlSearchParams: string) => {
  const params = new URLSearchParams(urlSearchParams);
  const hasArmSearchParam = params.get('useArm') === 'true';
  return hasArmSearchParam ? CpuArchitecture.ARM : CpuArchitecture.x86;
};

const getExistingClusterCpuArchitecture = (infraEnv: InfraEnv) => {
  return infraEnv.cpuArchitecture || CpuArchitecture.x86;
};

const ClusterDetailsService = {
  getClusterCreateParams(values: OcmClusterDetailsValues): ClusterCreateParamsWithStaticNetworking {
    const params: ClusterCreateParamsWithStaticNetworking = {
      name: values.name,
      highAvailabilityMode: values.highAvailabilityMode,
      openshiftVersion: values.openshiftVersion,
      pullSecret: values.pullSecret,
      baseDnsDomain: values.baseDnsDomain,
      cpuArchitecture: values.cpuArchitecture,
      diskEncryption: DiskEncryptionService.getDiskEncryptionParams(values),
    };
    if (isArmArchitecture({ cpuArchitecture: params.cpuArchitecture })) {
      params.userManagedNetworking = true;
    }
    if (values.hostsNetworkConfigurationType === HostsNetworkConfigurationType.STATIC) {
      params.staticNetworkConfig = getDummyInfraEnvField();
    }
    if (ocmClient) {
      params.tags = AI_UI_TAG;
    }
    return params;
  },
  getClusterUpdateParams(values: OcmClusterDetailsValues): ClusterDetailsUpdateParams {
    const params: ClusterDetailsUpdateParams = {
      name: values.name,
      baseDnsDomain: values.baseDnsDomain,
    };
    if (values.pullSecret) {
      params.pullSecret = values.pullSecret;
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
    return { ...values, cpuArchitecture, hostsNetworkConfigurationType };
  },
};

export default ClusterDetailsService;
