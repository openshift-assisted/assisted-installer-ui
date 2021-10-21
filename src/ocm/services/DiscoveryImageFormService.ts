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
      pullSecret: ocmPullSecret,
      sshPublicKey: formValues.sshPublicKey,
    };

    const infraEnvParams: InfraEnvUpdateParams = {
      proxy: {
        httpProxy: formValues.httpProxy,
        httpsProxy: formValues.httpsProxy,
        noProxy: formValues.noProxy,
      },
      sshAuthorizedKey: formValues.sshPublicKey,
      pullSecret: ocmPullSecret,
      staticNetworkConfig: formValues.staticNetworkConfig,
      imageType: formValues.imageType,
    };

    const { data: updatedCluster } = await ClustersAPI.update(clusterId, proxyParams);
    await InfraEnvsAPI.update(infraEnvId, infraEnvParams);

    return updatedCluster;
  },

  getInitialValues(infraEnv?: InfraEnv) {
    const initialValues: DiscoveryImageFormValues = {
      sshPublicKey: infraEnv?.sshAuthorizedKey || '',
      httpProxy: infraEnv?.proxy?.httpProxy || '',
      httpsProxy: infraEnv?.proxy?.httpsProxy || '',
      noProxy: infraEnv?.proxy?.noProxy || '',
      enableProxy: !!(
        infraEnv?.proxy?.httpProxy ||
        infraEnv?.proxy?.httpsProxy ||
        infraEnv?.proxy?.noProxy
      ),
      imageType: infraEnv?.type || 'full-iso',
    };

    return initialValues;
  },
};

export default DiscoveryImageFormService;
