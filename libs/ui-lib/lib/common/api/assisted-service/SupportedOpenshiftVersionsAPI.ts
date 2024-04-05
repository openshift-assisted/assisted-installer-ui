import { client } from '../../api/axiosClient';
import { OpenshiftVersion } from '@openshift-assisted/types/assisted-installer-service';

const SupportedOpenshiftVersionsAPI = {
  makeBaseURI(latestRelease: boolean) {
    return `/v2/openshift-versions?only_latest=${latestRelease.toString()}`;
  },

  list(latestRelease: boolean) {
    return client.get<OpenshiftVersion[]>(
      `${SupportedOpenshiftVersionsAPI.makeBaseURI(latestRelease)}`,
    );
  },
};

export default SupportedOpenshiftVersionsAPI;
