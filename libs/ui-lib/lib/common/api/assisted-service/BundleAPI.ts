import { client } from '../axiosClient';
import { Bundle } from '@openshift-assisted/types/assisted-installer-service';

const BundleAPI = {
  makeBaseURI() {
    return `/v2/operators/bundles`;
  },

  list(
    openshiftVersion?: string,
    cpuArchitecture?: string,
    platformType?: string,
    featureIds?: string,
  ) {
    return client.get<Bundle[]>(`${BundleAPI.makeBaseURI()}`, {
      params: {
        openshift_version: openshiftVersion,
        cpu_architecture: cpuArchitecture,
        platform_type: platformType,
        feature_ids: featureIds,
        ...(platformType === 'external' ? { external_platform_name: 'oci' } : {}),
      },
    });
  },

  listOperatorsForBundle(bundleName: string) {
    return client.get<string[]>(`${BundleAPI.makeBaseURI()}?bundle_name=${bundleName}`);
  },
};

export default BundleAPI;
