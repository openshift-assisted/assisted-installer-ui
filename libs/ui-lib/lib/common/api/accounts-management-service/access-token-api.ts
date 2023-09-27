import { ocmClient as client } from '../axiosClient';
import { AccessTokenCfg } from '@openshift-assisted/types/accounts-management-service';

export const AccessTokenAPI = {
  makeBaseURI() {
    return '/api/accounts_mgmt/v1/access_token';
  },

  async fetchPullSecret() {
    const response = await client?.post<AccessTokenCfg>(AccessTokenAPI.makeBaseURI());
    return response?.data;
  },
};
