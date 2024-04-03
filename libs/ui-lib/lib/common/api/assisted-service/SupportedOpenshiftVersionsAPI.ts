import { client } from '../../api/axiosClient';
import { OpenshiftVersion } from '@openshift-assisted/types/assisted-installer-service';

const SupportedOpenshiftVersionsAPI = {
  makeBaseURI(latest_release: boolean) {
    return `/v2/openshift-versions?only_latest=${latest_release.toString()}`;
  },

  list(latest_release: boolean) {
    return client.get<OpenshiftVersion[]>(
      `${SupportedOpenshiftVersionsAPI.makeBaseURI(latest_release)}`,
    );
  },
};

export default SupportedOpenshiftVersionsAPI;
