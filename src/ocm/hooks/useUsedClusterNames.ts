import React from 'react';
import { ClustersAPI, getErrorMessage, handleApiError } from '../api';
import { Cluster, useAlerts } from '../../common';

export default function useUsedClusterNames(
  clusterId: Cluster['id'],
  hookDeps?: React.DependencyList,
) {
  const { addAlert } = useAlerts();
  const [usedClusterNames, setUsedClusterNames] = React.useState<string[]>();
  React.useEffect(() => {
    const fetcher = async () => {
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
    };
    void fetcher();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, hookDeps);

  return { usedClusterNames };
}
