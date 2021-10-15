import React from 'react';
import { ManagedDomain, useAlerts } from '../../common';
import { ClusterDetailsService } from '../services';
import { getErrorMessage, handleApiError } from '../api';

export default function useManagedDomains(hookDeps?: React.DependencyList) {
  const { addAlert } = useAlerts();
  const [managedDomains, setManagedDomains] = React.useState<ManagedDomain[]>();

  React.useEffect(() => {
    const fetchManagedDomains = async () => {
      try {
        const domains = await ClusterDetailsService.getManagedDomains();
        setManagedDomains(domains);
      } catch (e) {
        setManagedDomains([]);
        handleApiError(e, () =>
          addAlert({ title: 'Failed to retrieve managed domains', message: getErrorMessage(e) }),
        );
      }
    };
    void fetchManagedDomains();
  }, hookDeps); // eslint-disable-line react-hooks/exhaustive-deps

  return managedDomains;
}
