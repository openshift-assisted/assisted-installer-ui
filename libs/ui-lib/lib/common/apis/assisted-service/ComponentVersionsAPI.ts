import { client } from '../../api';
import { ListVersions } from '../../../common';

const ComponentVersionsAPI = {
  makeBaseURI() {
    return `/v2/component-versions`;
  },

  list() {
    return client.get<ListVersions>(`${ComponentVersionsAPI.makeBaseURI()}`);
  },
};

export default ComponentVersionsAPI;
