import { getOcmClient } from '../axiosClient';
import { AccessTokenCfg } from '@openshift-assisted/types/accounts-management-service';

const client = getOcmClient();
export const AccessTokenAPI = {
  makeBaseURI() {
    return `/api/accounts_mgmt/v2/access_token`;
  },

  async fetchPullSecret() {
    let value: AccessTokenCfg | null = null;
    if (client) {
      const { data } = await client.post<AccessTokenCfg>(AccessTokenAPI.makeBaseURI());
      value = data;
    }

    return value;
  },
};
