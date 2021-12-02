import React from 'react';
import { ManagedDomain, useAlerts } from '../../common';
import { ClusterDetailsService } from '../services';
import { getErrorMessage, handleApiError } from '../api';

export default function useManagedDomains() {
  const [managedDomains, setManagedDomains] = React.useState<ManagedDomain[]>();
  const { addAlert } = useAlerts();

  const fetchManagedDomains = React.useCallback(async () => {
    try {
      const domains = await ClusterDetailsService.getManagedDomains();
      setManagedDomains(domains);
    } catch (e) {
      setManagedDomains([]);
      handleApiError(e, () =>
        addAlert({ title: 'Failed to retrieve managed domains', message: getErrorMessage(e) }),
      );
    }
  }, [addAlert]);

  React.useEffect(() => {
    if (!managedDomains) {
      fetchManagedDomains();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return managedDomains;
}
