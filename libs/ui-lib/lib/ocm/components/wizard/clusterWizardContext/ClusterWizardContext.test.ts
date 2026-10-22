import { describe, expect, it } from 'vitest';
import { getInstallDisconnected } from './ClusterWizardContext';
import type { ClusterWizardContextType } from './ClusterWizardContext';

describe('getInstallDisconnected', () => {
  it('returns false when the ClusterWizardContext is absent (e.g. Day 2 "Add Hosts" flow)', () => {
    // Regression: FormViewNetworkWide is rendered in the Day 2 tree where no
    // ClusterWizardContextProvider exists, so the optional hook yields null.
    expect(getInstallDisconnected(null)).toBe(false);
  });

  it('returns the context value when the ClusterWizardContext is present', () => {
    expect(getInstallDisconnected({ installDisconnected: true } as ClusterWizardContextType)).toBe(
      true,
    );
    expect(getInstallDisconnected({ installDisconnected: false } as ClusterWizardContextType)).toBe(
      false,
    );
  });
});
