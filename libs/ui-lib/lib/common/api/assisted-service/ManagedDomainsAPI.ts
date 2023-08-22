import { client } from '../../api/axiosClient';
import { ManagedDomain } from '../../../common/api/types';

const ManagedDomainsAPI = {
  makeBaseURI() {
    return `/v2/domains`;
  },

  list() {
    return client.get<ManagedDomain[]>(ManagedDomainsAPI.makeBaseURI());
  },
};

export default ManagedDomainsAPI;
