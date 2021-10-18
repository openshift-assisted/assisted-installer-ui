import { client } from '../../api/axiosClient';
import { OpenshiftVersion } from '../../../common';
import APIVersionService from '../APIVersionService';

const SupportedOpenshiftVersionsAPI = {
  getBaseURI() {
    return `/v${APIVersionService.version}/openshift-versions`;
  },

  list() {
    return client.get<OpenshiftVersion>(`${SupportedOpenshiftVersionsAPI.getBaseURI()}`);
  },
};

export default SupportedOpenshiftVersionsAPI;
