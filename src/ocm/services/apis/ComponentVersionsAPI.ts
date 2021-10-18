import { client } from '../../api';
import { ListVersions } from '../../../common';
import APIVersionService from '../APIVersionService';

const ComponentVersionsAPI = {
  makeBaseURI() {
    return `/${APIVersionService.version}/component-versions`;
  },

  list() {
    return client.get<ListVersions>(`${ComponentVersionsAPI.makeBaseURI()}`);
  },
};

export default ComponentVersionsAPI;
