import React from 'react';
import { getApiErrorMessage, handleApiError } from '../../common/api';
import { useAlerts } from '../../common';
import { AccessTokenAPI } from '../../common/api/accounts-management-service/access-token-api';

export default function usePullSecret() {
  const [pullSecret, setPullSecret] = React.useState<string>();
  const { addAlert } = useAlerts();

  const getPullSecret = React.useCallback(async () => {
    try {
      const accessTokenCfg = await AccessTokenAPI.fetchPullSecret();
      if (accessTokenCfg) {
        setPullSecret(JSON.stringify(accessTokenCfg)); // unmarshalled response as a string
      } else {
        setPullSecret('');
      }
    } catch (e) {
      handleApiError(e, (e) => {
        setPullSecret('');
        addAlert({ title: 'Failed to retrieve pull secret', message: getApiErrorMessage(e) });
      });
    }
  }, [addAlert]);

  React.useEffect(() => {
    if (!pullSecret) {
      void getPullSecret();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return pullSecret;
}
