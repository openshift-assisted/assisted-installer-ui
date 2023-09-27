import type { RootStateDay1 } from '../store/store-day1';
import type { FeatureFlagsState } from '../store/slices/feature-flags/slice';
import type { AsyncFeatureStatus } from '../store/slices/feature-flags/types/async-feature-status';
import { describe, it, vi, expect, afterEach, beforeEach } from 'vitest';
import { useFeatureDetection } from './use-feature-detection';
import { isFeatureEnabled } from '../store/slices/feature-flags/selectors';
import { storeDay1 } from '../store/store-day1';
import { render, unmountComponentAtNode } from 'react-dom';
import * as React from 'react';
import { featureFlagsActions } from '../store/slices/feature-flags/slice';
import { Provider } from 'react-redux';
import { act } from 'react-dom/test-utils';
import { externalFeatures } from '../config/external-features';

vi.mock('../../common/api/axiosClient.ts', async () => {
  const mod = await vi.importActual<typeof import('../../common/api/axiosClient')>(
    '../../common/api/axiosClient.ts',
  );
  return {
    ...mod,
    isInOcm: true,
  };
});
vi.mock('../config/external-features.ts', () => {
  const externalFeatures: AsyncFeatureStatus[] = [
    {
      name: 'ASSISTED_INSTALLER_PLATFORM_OCI',
      isEnabled: () => {
        return Promise.resolve(true);
      },
    },
    {
      name: 'ASSISTED_INSTALLER_MULTIARCH_SUPPORTED',
      isEnabled: () => {
        return Promise.resolve(false);
      },
    },
  ];

  return { externalFeatures };
});
vi.spyOn(featureFlagsActions, 'setFeatureFlag');

describe('use-feature-detection.ts', () => {
  let container: HTMLDivElement | null = null;

  beforeEach(() => {
    // setup a DOM element as a render target
    container = document.createElement('div');
    container.id = 'root';
    document.body.appendChild(container);
  });

  afterEach(() => {
    // cleanup on exiting
    if (container !== null) {
      unmountComponentAtNode(container);
      container.remove();
      container = null;
    }
    vi.clearAllMocks();
  });

  it('Internal features override external features', async () => {
    const DummyComponent: React.FC = () => {
      useFeatureDetection({ ASSISTED_INSTALLER_PLATFORM_OCI: false });
      return null;
    };

    await act(() =>
      Promise.resolve(
        render(
          <Provider store={storeDay1}>
            <DummyComponent />
          </Provider>,
          container,
        ),
      ),
    );

    expect(featureFlagsActions.setFeatureFlag).toHaveBeenCalledTimes(externalFeatures.length + 1);
    expect(
      isFeatureEnabled(
        storeDay1.getState() as RootStateDay1 & FeatureFlagsState,
        'ASSISTED_INSTALLER_PLATFORM_OCI',
      ),
    ).toBe(false);
  });

  it('Processes only features prefixed with ASSISTED_INSTALLER', async () => {
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
          container,
        ),
      ),
    );

    expect(featureFlagsActions.setFeatureFlag).toHaveBeenCalledTimes(externalFeatures.length);
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
