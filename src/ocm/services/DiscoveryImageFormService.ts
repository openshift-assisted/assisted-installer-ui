import {
  ClusterUpdateParams,
  InfraEnvUpdateParams,
  Cluster,
  InfraEnv,
} from '../../common/api/types';
import { ClustersAPI, InfraEnvsAPI } from './apis';
import { DiscoveryImageFormValues } from '../components/clusterConfiguration/types';

const DiscoveryImageFormService = {
  async update(
    clusterId: Cluster['id'],
    infraEnvId: InfraEnv['id'],
    formValues: DiscoveryImageFormValues,
    clusterKind: Cluster['kind'],
    ocmPullSecret?: string,
  ) {
    const proxyParams: ClusterUpdateParams = {
      httpProxy: formValues.httpProxy,
      httpsProxy: formValues.httpsProxy,
      noProxy: formValues.noProxy,
      // TODO(mlibra): Does the user need to change pull-secret?
      pullSecret: clusterKind === 'AddHostsCluster' && ocmPullSecret ? ocmPullSecret : undefined,
      sshPublicKey: formValues.sshPublicKey,
    };

    const { data: updatedCluster } = await ClustersAPI.update(clusterId, proxyParams);
    if (infraEnvId) {
      const infraEnvParams: InfraEnvUpdateParams = {
        proxy: {
          httpProxy: formValues.httpProxy,
          httpsProxy: formValues.httpsProxy,
          noProxy: formValues.noProxy,
        },
        sshAuthorizedKey: formValues.sshPublicKey,
        pullSecret: clusterKind === 'AddHostsCluster' && ocmPullSecret ? ocmPullSecret : undefined,
        staticNetworkConfig: formValues.staticNetworkConfig,
        imageType: formValues.imageType,
      };
      await InfraEnvsAPI.update(infraEnvId, infraEnvParams);
    }

    return updatedCluster;
  },
};

export default DiscoveryImageFormService;
