import {
  V2ClusterUpdateParams,
  InfraEnvUpdateParams,
  Cluster,
  InfraEnv,
} from '../../common/api/types';
import { InfraEnvsAPI } from './apis';
import { DiscoveryImageFormValues } from '../../common/components/clusterConfiguration';
import ClustersService from './ClustersService';

const DiscoveryImageFormService = {
  async update(
    cluster: Cluster,
    infraEnvId: InfraEnv['id'],
    formValues: DiscoveryImageFormValues,
    ocmPullSecret?: string,
  ) {
    const proxyParams: V2ClusterUpdateParams = {
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

    const { data: updatedCluster } = await ClustersService.update(cluster, proxyParams);
    const { data: updatedInfraEnv } = await InfraEnvsAPI.update(infraEnvId, infraEnvParams);

    return { updatedCluster, updatedInfraEnv };
  },
};

export default DiscoveryImageFormService;
