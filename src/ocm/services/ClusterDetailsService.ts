import {
  AI_UI_TAG,
  Cluster,
  V2ClusterUpdateParams,
  CpuArchitecture,
  InfraEnv,
  ManagedDomain,
  OpenshiftVersionOptionType,
  getClusterDetailsInitialValues,
  isArmArchitecture,
} from '../../common';
import { ClustersAPI } from '../services/apis';
import InfraEnvsService from './InfraEnvsService';
import omit from 'lodash/omit';
import DiskEncryptionService from './DiskEncryptionService';
import {
  ClusterCreateParamsWithStaticNetworking,
  HostsNetworkConfigurationType,
  OcmClusterDetailsValues,
} from './types';
import { getDummyInfraEnvField } from '../components/clusterConfiguration/staticIp/data/dummyData';
import ClustersService from './ClustersService';
import { ocmClient } from '../api';

const ClusterDetailsService = {
  async create(params: ClusterCreateParamsWithStaticNetworking) {
    const { data: cluster } = await ClustersAPI.register(omit(params, 'staticNetworkConfig'));
    await InfraEnvsService.create({
      name: `${params.name}_infra-env`,
      pullSecret: params.pullSecret,
      clusterId: cluster.id,
      openshiftVersion: params.openshiftVersion,
      cpuArchitecture: params.cpuArchitecture,
      staticNetworkConfig: params.staticNetworkConfig,
    });

    return cluster;
  },

  async update(
    clusterId: Cluster['id'],
    clusterTags: Cluster['tags'],
    params: V2ClusterUpdateParams,
  ) {
    const { data: updatedCluster } = await ClustersService.update(clusterId, clusterTags, params);
    return updatedCluster;
  },

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
