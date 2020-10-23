import React from 'react';
import { getErrorMessage, handleApiError, ocmClient } from '../../api';
import { AlertsContext } from '../AlertsContextProvider';

export const usePullSecretFetch = () => {
  const [pullSecret, setPullSecret] = React.useState<string>();
  const { addAlert } = React.useContext(AlertsContext);

  React.useEffect(() => {
    const getPullSecret = async () => {
      if (ocmClient) {
        try {
          const response = await ocmClient.post('/api/accounts_mgmt/v1/access_token');
          setPullSecret(response?.request?.response || ''); // unmarshalled response as a string
        } catch (e) {
          handleApiError(e, (e) => {
            setPullSecret('');
            addAlert({ title: 'Failed to retrieve pull secret', message: getErrorMessage(e) });
          });
        }
      } else {
        setPullSecret('');
      }
    };
    getPullSecret();
  });

  return pullSecret;
};
