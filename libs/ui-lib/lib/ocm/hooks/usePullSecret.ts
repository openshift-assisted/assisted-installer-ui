import React from 'react';
import { getApiErrorMessage, handleApiError, ocmClient } from '../api';
import { useAlerts } from '../../common';
import { OcmClientRequestResponse } from '../types';

export default function usePullSecret() {
  const [pullSecret, setPullSecret] = React.useState<string>();
  const { addAlert } = useAlerts();

  const getPullSecret = React.useCallback(async () => {
    try {
      if (ocmClient) {
        const response: OcmClientRequestResponse = await ocmClient.post<string>(
          '/api/accounts_mgmt/v1/access_token',
        );
        const data = response?.request?.response;
        setPullSecret(data || ''); // unmarshalled response as a string
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
