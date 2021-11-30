import React from 'react';
import { getErrorMessage, handleApiError, ocmClient } from '../api';
import { useAlerts } from '../../common';

export default function usePullSecret() {
  const [pullSecret, setPullSecret] = React.useState<string>('');
  const { addAlert } = useAlerts();

  const getPullSecret = React.useCallback(async () => {
    try {
      if (ocmClient) {
        const response = await ocmClient.post('/api/accounts_mgmt/v1/access_token');
        setPullSecret(response?.request?.response || ''); // unmarshalled response as a string
      } else {
        setPullSecret('');
      }
    } catch (e) {
      handleApiError(e, (e) => {
        setPullSecret('');
        addAlert({ title: 'Failed to retrieve pull secret', message: getErrorMessage(e) });
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
