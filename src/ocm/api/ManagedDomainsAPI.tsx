import { client } from './axiosClient';
import { ManagedDomain } from '../../common';

const ManagedDomainsAPI = {
  getBaseURI() {
    return '/v2/domains';
  },

  get() {
    return client.get<ManagedDomain[]>('/v2/domains');
  },
};

export default ManagedDomainsAPI;
