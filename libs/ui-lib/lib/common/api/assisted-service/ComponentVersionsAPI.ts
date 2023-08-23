import { client } from '../../api/axiosClient';
import { ListVersions } from '@openshift-assisted/types/assisted-installer-service';

const ComponentVersionsAPI = {
  makeBaseURI() {
    return `/v2/component-versions`;
  },

  list() {
    return client.get<ListVersions>(`${ComponentVersionsAPI.makeBaseURI()}`);
  },
};

export default ComponentVersionsAPI;
