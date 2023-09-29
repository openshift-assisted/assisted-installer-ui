import type { RootStateDay1 } from '../store/store-day1';
import type { FeatureFlagsState } from '../store/slices/feature-flags/slice';
import type { Account, Organization } from '@openshift-assisted/types/accounts-management-service';
import { describe, it, vi, expect } from 'vitest';
import * as React from 'react';
import { Provider } from 'react-redux';
import { render } from 'react-dom';
import { act } from 'react-dom/test-utils';
import { featureFlagsActions } from '../store/slices/feature-flags/slice';
import { isFeatureEnabled } from '../store/slices/feature-flags/selectors';
import { storeDay1 } from '../store/store-day1';
import { useFeatureDetection } from './use-feature-detection';
import { externalFeaturesMappings } from '../config/external-features';
import { CurrentAccountApi } from '../../common/api/accounts-management-service/current-account-api';
import { OrganizationsApi } from '../../common/api/accounts-management-service/organizations-api';
import { getMockContainer } from '../../_test-helpers/mock-container';

vi.mock('../../common/api/axiosClient.ts', async () => {
  const mod = await vi.importActual<typeof import('../../common/api/axiosClient')>(
    '../../common/api/axiosClient.ts',
  );
  return {
    ...mod,
    isInOcm: true,
  };
});
vi.spyOn(featureFlagsActions, 'setFeatureFlag');

describe('use-feature-detection.ts', () => {
  it('Internal features override external features', async () => {
    const DummyComponent: React.FC = () => {
      useFeatureDetection({ ASSISTED_INSTALLER_PLATFORM_OCI: false });
      return null;
    };
    vi.spyOn(CurrentAccountApi, 'getCurrentAccount').mockImplementation(() => {
      return Promise.resolve({
        username: 'jdoe',
      } as Account);
    });
    vi.spyOn(OrganizationsApi, 'getOrganization').mockImplementation(() => {
      return Promise.resolve({
        capabilities: [
          {
            name: 'capability.organization.bare_metal_installer_platform_oci',
            value: 'true',
          },
        ],
      } as Organization);
    });

    await act(() =>
      Promise.resolve(
        render(
          <Provider store={storeDay1}>
            <DummyComponent />
          </Provider>,
          getMockContainer(),
        ),
      ),
    );

    expect(featureFlagsActions.setFeatureFlag).toHaveBeenCalled();
    expect(
      isFeatureEnabled(
        storeDay1.getState() as RootStateDay1 & FeatureFlagsState,
        'ASSISTED_INSTALLER_PLATFORM_OCI',
      ),
    ).toBe(false);
  });

  it.skip('Processes only features prefixed with ASSISTED_INSTALLER', async () => {
    const DummyComponent: React.FC = () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      useFeatureDetection({ NON_ASSISTED_INSTALLER_FEATURE: true });
      return null;
    };

    await act(() =>
      Promise.resolve(
        render(
          <Provider store={storeDay1}>
            <DummyComponent />
          </Provider>,
          getMockContainer(),
        ),
      ),
    );

    expect(featureFlagsActions.setFeatureFlag).toHaveBeenCalledTimes(
      externalFeaturesMappings.length,
    );
    expect(
      isFeatureEnabled(
        storeDay1.getState() as RootStateDay1 & FeatureFlagsState,
        'ASSISTED_INSTALLER_MULTIARCH_SUPPORTED',
      ),
    ).toBe(false);
    expect(
      storeDay1.getState().featureFlags.data['NON_ASSISTED_INSTALLER_FEATURE'],
    ).not.toBeDefined();
    expect(Object.keys(storeDay1.getState().featureFlags.data)).toHaveLength(3);
  });
});
