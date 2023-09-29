import { ocmClient as client } from '../axiosClient';
import { Organization } from '@openshift-assisted/types/accounts-management-service';

export const OrganizationsApi = {
  makeBaseURI() {
    return '/api/accounts_mgmt/v1/organizations';
  },

  async getOrganization(orgId: string, fetchCapabilities = true, fetchLabels = false) {
    const response = await client?.get<Organization>(`${OrganizationsApi.makeBaseURI()}/${orgId}`, {
      params: { fetchCapabilities, fetchLabels },
    });
    return response?.data;
  },
};
