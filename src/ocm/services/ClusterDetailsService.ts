import { ClusterCreateParams, V2ClusterUpdateParams } from '../../common';
import { ClustersAPI, ManagedDomainsAPI } from '../services/apis';
import InfraEnvsService from './InfraEnvsService';
import _ from 'lodash';
import DiskEncryptionService from './DiskEncryptionService';
import { OcmClusterDetailsValues } from '../api/types';
import { isArmArchitecture } from '../../common/selectors/clusterSelectors';

const ClusterDetailsService = {
  async create(params: ClusterCreateParams) {
    const { data: cluster } = await ClustersAPI.register(params);
    await InfraEnvsService.create({
      name: `${params.name}_infra-env`,
      pullSecret: params.pullSecret,
      clusterId: cluster.id,
      // TODO(jkilzi): MGMT-7709 will deprecate the openshiftVersion field, remove the line below once it happens.
      openshiftVersion: params.openshiftVersion,
      cpuArchitecture: params.cpuArchitecture,
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

  getClusterCreateParams(values: OcmClusterDetailsValues): ClusterCreateParams {
    const params: ClusterCreateParams = _.omit(values, [
      'useRedHatDnsService',
      'SNODisclaimer',
      'enableDiskEncryptionOnMasters',
      'enableDiskEncryptionOnWorkers',
      'diskEncryptionMode',
      'diskEncryption',
      'diskEncryptionTangServers',
    ]);
    params.diskEncryption = DiskEncryptionService.getDiskEncryptionParams(values);
    if (isArmArchitecture({ cpuArchitecture: params.cpuArchitecture })) {
      params.userManagedNetworking = true;
    }
    return params;
  },
};

export default ClusterDetailsService;
