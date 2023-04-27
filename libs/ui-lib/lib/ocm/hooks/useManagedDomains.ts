import React from 'react';
import { ManagedDomain, useAlerts } from '../../common';
import { getApiErrorMessage, handleApiError } from '../api';
import { ManagedDomainsAPI } from '../services/apis';

export default function useManagedDomains() {
  const [managedDomains, setManagedDomains] = React.useState<ManagedDomain[]>();
  const { addAlert } = useAlerts();

  const fetchManagedDomains = React.useCallback(async () => {
    try {
      const { data: domains } = await ManagedDomainsAPI.list();
      setManagedDomains(domains);
    } catch (e) {
      setManagedDomains([]);
      handleApiError(e, () =>
        addAlert({ title: 'Failed to retrieve managed domains', message: getApiErrorMessage(e) }),
      );
    }
  }, [addAlert]);

  React.useEffect(() => {
    if (!managedDomains) {
      void fetchManagedDomains();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return managedDomains;
}
