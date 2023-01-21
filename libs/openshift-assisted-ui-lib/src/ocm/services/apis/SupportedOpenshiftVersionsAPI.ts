import { client } from '../../api/axiosClient';
import { OpenshiftVersions } from '../../../common';

const SupportedOpenshiftVersionsAPI = {
  makeBaseURI() {
    return `/v2/openshift-versions`;
  },

  list() {
    return client.get<OpenshiftVersions>(`${SupportedOpenshiftVersionsAPI.makeBaseURI()}`);
  },
};

export default SupportedOpenshiftVersionsAPI;
