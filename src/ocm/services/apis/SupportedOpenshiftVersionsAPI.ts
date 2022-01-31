import { noCoverterClient } from '../../api/axiosClient';
import { OpenshiftVersion } from '../../../common';

const SupportedOpenshiftVersionsAPI = {
  makeBaseURI() {
    return `/v2/openshift-versions`;
  },

  list() {
    //use client without camel case converter, since openshift verion keys can contain hyphens
    return noCoverterClient.get<OpenshiftVersion>(`${SupportedOpenshiftVersionsAPI.makeBaseURI()}`);
  },
};

export default SupportedOpenshiftVersionsAPI;
