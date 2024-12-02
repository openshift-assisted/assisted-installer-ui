import type { Account, Organization } from '@openshift-assisted/types/accounts-management-service';
import { describe, it, vi, expect } from 'vitest';
import * as React from 'react';
import { Provider } from 'react-redux';
import { act } from 'react-dom/test-utils';
import { featureFlagsActions } from '../store/slices/feature-flags/slice';
import { storeDay1 } from '../store/store-day1';
import { useFeatureDetection } from './use-feature-detection';
import { CurrentAccountApi } from '../../common/api/accounts-management-service/current-account-api';
import { OrganizationsApi } from '../../common/api/accounts-management-service/organizations-api';
import { getMockContainer } from '../../_test-helpers/mock-container';

vi.spyOn(featureFlagsActions, 'setFeatureFlag');
vi.spyOn(CurrentAccountApi, 'getCurrentAccount').mockImplementation(() => {
  return Promise.resolve({
    username: 'jdoe',
  } as Account);
});

const makeSpyOn$OrganizationsApi$getOrganization = (mockResponse: Organization) =>
  vi.spyOn(OrganizationsApi, 'getOrganization').mockImplementation(() => {
    return Promise.resolve(mockResponse);
  });

describe('use-feature-detection.ts', () => {
  it('Sets only external features when no overrides are provided', async () => {
    const DummyComponent: React.FC = () => {
      useFeatureDetection();
      return null;
    };
    makeSpyOn$OrganizationsApi$getOrganization({
      capabilities: [
        {
          name: 'capability.organization.bare_metal_installer_platform_oci',
          value: 'true',
          inherited: true,
        },
      ],
    });

    const mockContainer = getMockContainer();

    if (mockContainer) {
      await act(() =>
        Promise.resolve(
          mockContainer.render(
            <Provider store={storeDay1}>
              <DummyComponent />
            </Provider>,
          ),
        ),
      );
    }
  });

  it('Internal features override external features', async () => {
    const DummyComponent: React.FC = () => {
      return null;
    };
    makeSpyOn$OrganizationsApi$getOrganization({
      capabilities: [
        {
          name: 'capability.organization.bare_metal_installer_platform_oci',
          value: 'false',
          inherited: true,
        },
      ],
    });

    const mockContainer = getMockContainer();

    if (mockContainer) {
      await act(() =>
        Promise.resolve(
          mockContainer.render(
            <Provider store={storeDay1}>
              <DummyComponent />
            </Provider>,
          ),
        ),
      );
    }
  });

  it('Processes only features prefixed with ASSISTED_INSTALLER', async () => {
    const featuresOverride = { NON_ASSISTED_INSTALLER_FEATURE: true };
    const DummyComponent: React.FC = () => {
      useFeatureDetection(featuresOverride);
      return null;
    };

    const mockContainer = getMockContainer();

    if (mockContainer) {
      await act(() =>
        Promise.resolve(
          mockContainer.render(
            <Provider store={storeDay1}>
              <DummyComponent />
            </Provider>,
          ),
        ),
      );
    }
    /* Here we don't mock the call to the user organization API, therefore the
     * capabilities in the currentUser slice should remain undefined, since the list
     * of featuresOverride should get filtered out of features not prefixed with
     * "ASSISTED_INSTALLER" there should be no call to setFeatureFlag.
     */
    expect(featureFlagsActions.setFeatureFlag).not.toHaveBeenCalled();
    expect(
      storeDay1.getState().featureFlags.data['NON_ASSISTED_INSTALLER_FEATURE'],
    ).not.toBeDefined();
  });
});
