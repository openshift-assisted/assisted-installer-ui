import {
  Cluster,
  V2ClusterUpdateParams,
  CpuArchitecture,
  getClusterDetailsInitialValues,
  InfraEnv,
  ManagedDomain,
  OpenshiftVersionOptionType,
  getDefaultNetworkType,
} from '../../common';
import { ClustersAPI, ManagedDomainsAPI } from '../services/apis';
import InfraEnvsService from './InfraEnvsService';
import omit from 'lodash/omit';
import DiskEncryptionService from './DiskEncryptionService';
import { isArmArchitecture, isSNO } from '../../common/selectors/clusterSelectors';
import { CreateParams, HostsNetworkConfigurationType, OcmClusterDetailsValues } from './types';
import { getDummyInfraEnvField } from '../components/clusterConfiguration/staticIp/data/dummyData';

const ClusterDetailsService = {
  async create(params: CreateParams) {
    const { data: cluster } = await ClustersAPI.register(omit(params, 'staticNetworkConfig'));
    await InfraEnvsService.create({
      name: `${params.name}_infra-env`,
      pullSecret: params.pullSecret,
      clusterId: cluster.id,
      // TODO(jkilzi): MGMT-7709 will deprecate the openshiftVersion field, remove the line below once it happens.
      openshiftVersion: params.openshiftVersion,
      cpuArchitecture: params.cpuArchitecture,
      staticNetworkConfig: params.staticNetworkConfig,
    });

    return cluster;
  },

  async update(clusterId: string, params: V2ClusterUpdateParams) {
    const { data: cluster } = await ClustersAPI.update(clusterId, params);
    return cluster;
  },

  async getManagedDomains() {
    const { data: domains } = await ManagedDomainsAPI.list();
    return domains;
  },

  getClusterCreateParams(values: OcmClusterDetailsValues): CreateParams {
    const isSNOCluster = isSNO(values);
    const params: CreateParams = omit(values, [
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
    params.networkType = getDefaultNetworkType(isSNOCluster);
    if (values.hostsNetworkConfigurationType === HostsNetworkConfigurationType.STATIC) {
      params.staticNetworkConfig = getDummyInfraEnvField();
    }
    return params;
  },

  getClusterDetailsInitialValues({
    cluster,
    infraEnv,
    ...args
  }: {
    cluster?: Cluster;
    infraEnv?: InfraEnv;
    pullSecret?: string;
    managedDomains: ManagedDomain[];
    ocpVersions: OpenshiftVersionOptionType[];
  }): OcmClusterDetailsValues {
    const values = getClusterDetailsInitialValues({
      cluster,
      ...args,
    });
    const cpuArchitecture = cluster?.cpuArchitecture || CpuArchitecture.x86;
    const hostsNetworkConfigurationType = infraEnv?.staticNetworkConfig
      ? HostsNetworkConfigurationType.STATIC
      : HostsNetworkConfigurationType.DHCP;
    return { ...values, cpuArchitecture, hostsNetworkConfigurationType };
  },
};

export default ClusterDetailsService;
