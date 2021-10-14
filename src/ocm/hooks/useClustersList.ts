import React from 'react';
import { Cluster } from '../../common';
import { ClustersAPI, handleApiError } from '../api';

export default function useClustersList(hookDeps?: React.DependencyList) {
  const [error, setError] = React.useState('');
  const [clusters, setClusters] = React.useState<Cluster[]>([]);
  React.useEffect(() => {
    const fetchClusters = async () => {
      try {
        const { data } = await ClustersAPI.list();
        setClusters(data);
      } catch (e) {
        return handleApiError(e, () => setError('Failed to fetch cluster.'));
      }
    };

    void fetchClusters();
  }, hookDeps);

  return {
    loading: !error && !clusters,
    error,
    clusters,
  };
}
