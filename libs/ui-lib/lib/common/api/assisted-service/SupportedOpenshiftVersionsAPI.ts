import { client } from '../../api/axiosClient';
import { OpenshiftVersion } from '@openshift-assisted/types/assisted-installer-service';

const SupportedOpenshiftVersionsAPI = {
  makeBaseURI() {
    return `/v2/openshift-versions`;
  },

  list() {
    return client.get<OpenshiftVersion[]>(`${SupportedOpenshiftVersionsAPI.makeBaseURI()}`);
  },
};

export default SupportedOpenshiftVersionsAPI;
