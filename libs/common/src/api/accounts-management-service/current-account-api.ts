import { ocmClient as client } from '../axiosClient';
import { Account } from '@openshift-assisted/types/accounts-management-service';

export const CurrentAccountApi = {
  makeBaseURI() {
    return '/api/accounts_mgmt/v1/current_account';
  },

  async getCurrentAccount() {
    const response = await client?.get<Account>(CurrentAccountApi.makeBaseURI());
    return response?.data;
  },
};
