import { client } from '../../api/axiosClient';
import { OpenshiftVersion } from '@openshift-assisted/types/assisted-installer-service';

const OfflineOpenshiftVersionsAPI = {
  makeBaseURI(version: string) {
    return `/v2/offline-openshift-versions?version=${version}`;
  },

  list(version: string) {
    return client.get<Record<string, OpenshiftVersion>>(
      `${OfflineOpenshiftVersionsAPI.makeBaseURI(version)}`,
    );
  },
};

export default OfflineOpenshiftVersionsAPI;
