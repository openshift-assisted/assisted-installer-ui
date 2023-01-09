import {
  V2ClusterUpdateParams,
  InfraEnvUpdateParams,
  Cluster,
  InfraEnv,
  ImageType,
} from '../../common/api/types';
import { InfraEnvsAPI } from './apis';
import ClustersService from './ClustersService';
import { OcmDiscoveryImageFormValues } from '../components/clusterConfiguration/OcmDiscoveryImageConfigForm';

const DiscoveryImageFormService = {
  async update(
    clusterId: Cluster['id'],
    clusterTags: Cluster['tags'],
    infraEnvId: InfraEnv['id'],
    formValues: OcmDiscoveryImageFormValues,
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
      additionalTrustBundle: formValues.trustBundle,
      imageType: formValues.imageType as ImageType,
    };

    const { data: updatedCluster } = await ClustersService.update(
      clusterId,
      clusterTags,
      proxyParams,
    );
    InfraEnvsAPI.abortLastGetRequest();
    const { data: updatedInfraEnv } = await InfraEnvsAPI.update(infraEnvId, infraEnvParams);

    return { updatedCluster, updatedInfraEnv };
  },
};

export default DiscoveryImageFormService;
