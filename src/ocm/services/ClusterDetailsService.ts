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
import omit from 'lodash/omit';
import DiskEncryptionService from './DiskEncryptionService';
import {
  ClusterCreateParamsWithStaticNetworking,
  HostsNetworkConfigurationType,
  OcmClusterDetailsValues,
} from './types';
import { getDummyInfraEnvField } from '../components/clusterConfiguration/staticIp/data/dummyData';
import { ocmClient } from '../api';

const ClusterDetailsService = {
  getClusterCreateParams(values: OcmClusterDetailsValues): ClusterCreateParamsWithStaticNetworking {
    const params: ClusterCreateParamsWithStaticNetworking = omit(values, [
      'useRedHatDnsService',
      'SNODisclaimer',
      'enableDiskEncryptionOnMasters',
      'enableDiskEncryptionOnWorkers',
      'diskEncryptionMode',
      'diskEncryption',
      'diskEncryptionTangServers',
      'hostsNetworkConfigurationType',
    ]);
    params.diskEncryption = DiskEncryptionService.getDiskEncryptionParams(values);
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
    const params = new URLSearchParams(urlSearchParams);
    const hasArmSearchParam = params.get('useArm') === 'true';
    const cpuArchitecture =
      cluster?.cpuArchitecture || (hasArmSearchParam ? CpuArchitecture.ARM : CpuArchitecture.x86);
    const hostsNetworkConfigurationType = infraEnv?.staticNetworkConfig
      ? HostsNetworkConfigurationType.STATIC
      : HostsNetworkConfigurationType.DHCP;
    return { ...values, cpuArchitecture, hostsNetworkConfigurationType };
  },
};

export default ClusterDetailsService;
