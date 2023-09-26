import { Capability } from '@openshift-assisted/types/accounts-management-service';
import { CurrentAccountApi } from '../../common/api/accounts-management-service/current-account-api';
import { OrganizationsApi } from '../../common/api/accounts-management-service/organizations-api';

type FindCapabilityResult = { status: 'FOUND'; capability: Capability } | { status: 'NOT_FOUND' };
export const CapabilitiesService = {
  /**
   * Attempts to find the given capability in the current user account or in the organization they belong to.
   */
  async findCapability(capabilityId: string): Promise<FindCapabilityResult> {
    let result: FindCapabilityResult = { status: 'NOT_FOUND' };
    const account = await CurrentAccountApi.getCurrentAccount();
    let capability = account?.capabilities?.find(({ id }) => id === capabilityId);
    if (capability) {
      result = { status: 'FOUND', capability };
    } else {
      const organizationId = account?.organization?.id;
      if (organizationId) {
        const organization = await OrganizationsApi.getOrganization(organizationId);
        capability = organization?.capabilities?.find(({ id }) => id === capabilityId);
        result = capability ? { status: 'FOUND', capability } : { status: 'NOT_FOUND' };
      }
    }

    return result;
  },

  /**
   * Checks whether the given capability is enabled or not. Returns `false` if it cannot be found.
   */
  async isCapabilityEnabled(capabilityId: string) {
    let isEnabled = false;
    const result = await CapabilitiesService.findCapability(capabilityId);
    if (result.status === 'FOUND') {
      isEnabled = result.capability.value === 'true';
    }

    return isEnabled;
  },
};
