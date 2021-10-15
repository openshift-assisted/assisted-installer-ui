import { ClusterCreateParams, ClusterUpdateParams } from '../../common';
import { ClustersAPI, ManagedDomainsAPI } from '../services/apis';
import InfraEnvsService from './InfraEnvsService';

const ClusterDetailsService = {
  async create(params: ClusterCreateParams) {
    const { data: cluster } = await ClustersAPI.register(params);
    await InfraEnvsService.create({
      name: `${params.name}_infra-env`,
      pullSecret: params.pullSecret,
      clusterId: cluster.id,
      // TODO(jkilzi): MGMT-7709 will deprecate the openshiftVersion field, remove the line below once it happens.
      openshiftVersion: params.openshiftVersion,
    });

    return cluster;
  },

  async update(clusterId: string, params: ClusterUpdateParams) {
    const { data: cluster } = await ClustersAPI.update(clusterId, params);
    return cluster;
  },

  async getManagedDomains() {
    const { data: domains } = await ManagedDomainsAPI.get();
    return domains;
  },
};

export default ClusterDetailsService;
