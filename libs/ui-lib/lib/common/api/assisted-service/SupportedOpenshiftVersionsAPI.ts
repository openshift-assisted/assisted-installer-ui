import { client } from '../../api/axiosClient';
import { OpenshiftVersion } from '../../../common/api/types';

const SupportedOpenshiftVersionsAPI = {
  makeBaseURI() {
    return `/v2/openshift-versions`;
  },

  list() {
    return client.get<OpenshiftVersion[]>(`${SupportedOpenshiftVersionsAPI.makeBaseURI()}`);
  },
};

export default SupportedOpenshiftVersionsAPI;
