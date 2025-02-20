import { client } from '../axiosClient';
import { Bundle } from '@openshift-assisted/types/assisted-installer-service';

const BundleAPI = {
  makeBaseURI() {
    return `/v2/operators/bundles`;
  },

  list() {
    return client.get<Bundle[]>(`${BundleAPI.makeBaseURI()}`);
  },

  listOperatorsForBundle(bundleName: string) {
    return client.get<string[]>(`${BundleAPI.makeBaseURI()}?bundle_name=${bundleName}`);
  },
};

export default BundleAPI;
