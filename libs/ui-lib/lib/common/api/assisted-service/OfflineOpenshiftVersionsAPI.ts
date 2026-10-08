import { OpenshiftVersion } from '@openshift-assisted/types/assisted-installer-service';
import { client } from '../../api/axiosClient';

const OfflineOpenshiftVersionsAPI = {
  makeBaseURI() {
    return '/v2/offline-openshift-versions';
  },

  list() {
    return client.get<Record<string, OpenshiftVersion>>(OfflineOpenshiftVersionsAPI.makeBaseURI());
  },
};

export default OfflineOpenshiftVersionsAPI;
