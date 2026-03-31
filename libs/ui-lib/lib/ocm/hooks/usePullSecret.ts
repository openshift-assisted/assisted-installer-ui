import React from 'react';
import { getApiErrorMessage, handleApiError, isInOcm } from '../../common/api';
import { useAlerts } from '../../common';
import { AccessTokenAPI } from '../../common/api/accounts-management-service/access-token-api';

/**
 * Standalone / disconnected UI: bridge serves GET /pull-secret from a mounted manifest
 * (see assisted-disconnected-ui proxy).
 */
async function fetchPullSecretFromBridge(): Promise<string | undefined> {
  const res = await fetch('/api/pull-secret', { credentials: 'same-origin' });
  if (!res.ok) {
    throw new Error(`Unexpected status code ${res.status}`);
  }
  const text = (await res.text()).trim();
  return text || undefined;
}

export default function usePullSecret(isSingleClusterFeatureEnabled?: boolean) {
  const [pullSecret, setPullSecret] = React.useState<string>();
  const { addAlert } = useAlerts();

  const getPullSecret = React.useCallback(async () => {
    try {
      if (isInOcm) {
        const accessTokenCfg = await AccessTokenAPI.fetchPullSecret();
        if (accessTokenCfg) {
          setPullSecret(JSON.stringify(accessTokenCfg)); // unmarshalled response as a string
        } else {
          setPullSecret('');
        }
        return;
      }

      if (isSingleClusterFeatureEnabled) {
        const fromBridge = await fetchPullSecretFromBridge();
        setPullSecret(fromBridge ?? '');
        return;
      }

      // Non-OCM multinode flow: user enters pull secret manually.
      setPullSecret('');
    } catch (e) {
      handleApiError(e, (e) => {
        setPullSecret('');
        addAlert({ title: 'Failed to retrieve pull secret', message: getApiErrorMessage(e) });
      });
    }
  }, [addAlert, isSingleClusterFeatureEnabled]);

  React.useEffect(() => {
    if (!pullSecret) {
      void getPullSecret();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return pullSecret;
}
