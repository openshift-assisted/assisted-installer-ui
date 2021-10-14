import { client } from './axiosClient';
import { ListVersions, OpenshiftVersions } from '../../common';

const VersionsAPI = {
  getComponentVersions() {
    return client.get<ListVersions>('/v2/component-versions');
  },

  getOpenshiftVersions() {
    return client.get<OpenshiftVersions>('/v2/openshift-versions');
  },
};

export default VersionsAPI;
