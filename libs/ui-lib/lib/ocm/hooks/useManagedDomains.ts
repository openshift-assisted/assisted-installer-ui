import React from 'react';
import { useAlerts } from '../../common';
import { getApiErrorMessage, handleApiError } from '../api';
import { ManagedDomainsAPI } from '../services/apis';
import { ManagedDomain } from '@openshift-assisted/types/assisted-installer-service';

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
