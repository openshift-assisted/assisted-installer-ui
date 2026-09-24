import { OpenshiftVersion } from '@openshift-assisted/types/assisted-installer-service';
import { client } from '../../api/axiosClient';

const OfflineOpenshiftVersionsAPI = {
  makeBaseURI(version?: string) {
    const base = '/v2/offline-openshift-versions';
    return version ? `${base}?version=${version}` : base;
  },

  list(version?: string) {
    return client.get<Record<string, OpenshiftVersion>>(
      OfflineOpenshiftVersionsAPI.makeBaseURI(version),
    );
  },
};

export default OfflineOpenshiftVersionsAPI;
