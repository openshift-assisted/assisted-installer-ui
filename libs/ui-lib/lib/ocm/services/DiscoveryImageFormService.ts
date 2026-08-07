import {
  V2ClusterUpdateParams,
  InfraEnvUpdateParams,
  Cluster,
  InfraEnv,
  ImageType,
} from '@openshift-assisted/types/assisted-installer-service';
import { InfraEnvsAPI } from './apis';
import ClustersService from './ClustersService';
import { trimCommaSeparatedList } from '../../common/components/ui/formik/utils';
import { OcmDiscoveryImageFormValues } from '../components/clusterConfiguration/OcmDiscoveryImageConfigForm';

const getNtpUpdateParams = (formValues: OcmDiscoveryImageFormValues) => {
  const ntpList =
    formValues.enableNtpSources && formValues.ntpSourcesList
      ? trimCommaSeparatedList(formValues.ntpSourcesList)
      : undefined;

  return ntpList?.length
    ? { clusterNtpParams: { ntpSources: ntpList }, infraEnvNtpParams: { ntpSources: ntpList } }
    : { clusterNtpParams: {}, infraEnvNtpParams: {} };
};

const DiscoveryImageFormService = {
  async update(
    clusterId: Cluster['id'],
    clusterTags: Cluster['tags'],
    infraEnvId: InfraEnv['id'],
    formValues: OcmDiscoveryImageFormValues,
    ocmPullSecret?: string,
    isIpxeImage?: boolean,
  ) {
    const { clusterNtpParams, infraEnvNtpParams } = getNtpUpdateParams(formValues);

    const proxyParams: V2ClusterUpdateParams = {
      httpProxy: formValues.httpProxy,
      httpsProxy: formValues.httpsProxy,
      noProxy: formValues.noProxy,
      // TODO(mlibra): Does the user need to change pull-secret?
      pullSecret: ocmPullSecret || undefined,
      sshPublicKey: formValues.sshPublicKey,
      ...clusterNtpParams,
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
      imageType: isIpxeImage ? undefined : (formValues.imageType as ImageType),
      ...infraEnvNtpParams,
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
