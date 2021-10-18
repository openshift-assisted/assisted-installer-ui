import { client } from '../../api/axiosClient';
import { ManagedDomain } from '../../../common';
import APIVersionService from '../APIVersionService';

const ManagedDomainsAPI = {
  getBaseURI() {
    return `/v${APIVersionService.version}/domains`;
  },

  list() {
    return client.get<ManagedDomain[]>(ManagedDomainsAPI.getBaseURI());
  },
};

export default ManagedDomainsAPI;
