import { client } from '../../api/axiosClient';
import { OpenshiftVersion } from '@openshift-assisted/types/assisted-installer-service';

const SupportedOpenshiftVersionsAPI = {
  makeBaseURI(latest_release: string) {
    return `/v2/openshift-versions?only_latest=${latest_release}`;
  },

  list(allVersions: string) {
    return client.get<OpenshiftVersion[]>(
      `${SupportedOpenshiftVersionsAPI.makeBaseURI(allVersions)}`,
    );
  },
};

export default SupportedOpenshiftVersionsAPI;
