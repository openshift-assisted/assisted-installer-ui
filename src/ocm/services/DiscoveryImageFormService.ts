import {
  ClusterUpdateParams,
  InfraEnvUpdateParams,
  Cluster,
  InfraEnv,
} from '../../common/api/types';
import { ClustersAPI, InfraEnvsAPI } from './apis';
import { DiscoveryImageFormValues } from '../../common/components/clusterConfiguration';

const DiscoveryImageFormService = {
  async update(
    clusterId: Cluster['id'],
    infraEnvId: InfraEnv['id'],
    clusterKind: Cluster['kind'],
    formValues: DiscoveryImageFormValues,
    ocmPullSecret?: string,
  ) {
    const proxyParams: ClusterUpdateParams = {
      httpProxy: formValues.httpProxy,
      httpsProxy: formValues.httpsProxy,
      noProxy: formValues.noProxy,
      // TODO(mlibra): Does the user need to change pull-secret?
      pullSecret: ocmPullSecret || undefined,
      sshPublicKey: formValues.sshPublicKey,
    };

    const infraEnvParams: InfraEnvUpdateParams = {
      proxy: {
        httpProxy: formValues.httpProxy,
        httpsProxy: formValues.httpsProxy,
        noProxy: formValues.noProxy,
      },
      sshAuthorizedKey: formValues.sshPublicKey,
      pullSecret: ocmPullSecret || undefined,
      staticNetworkConfig: formValues.staticNetworkConfig,
      imageType: formValues.imageType,
    };

    const { data: updatedCluster } = await ClustersAPI.update(clusterId, proxyParams);
    await InfraEnvsAPI.update(infraEnvId, infraEnvParams);

    return updatedCluster;
  },
};

export default DiscoveryImageFormService;
