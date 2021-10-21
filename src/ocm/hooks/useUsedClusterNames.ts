import React from 'react';
import { getErrorMessage, handleApiError } from '../api';
import { ClustersAPI } from '../services/apis';
import { Cluster, useAlerts } from '../../common';

export default function useUsedClusterNames(clusterId: Cluster['id']) {
  const [usedClusterNames, setUsedClusterNames] = React.useState<string[]>();
  const { addAlert } = useAlerts();

  const fetcher = React.useCallback(async () => {
    try {
      const { data: clusters } = await ClustersAPI.list();
      const names = clusters
        .filter((c) => c.id !== clusterId)
        .map((c) => `${c.name}.${c.baseDnsDomain}`);
      setUsedClusterNames(names);
    } catch (e) {
      setUsedClusterNames([]);
      handleApiError(e, () =>
        addAlert({
          title: 'Failed to retrieve names of existing clusters.',
          message: getErrorMessage(e),
        }),
      );
    }
  }, [addAlert, clusterId]);

  React.useEffect(() => {
    void fetcher();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { usedClusterNames };
}
