import React from 'react';
import {
  Cluster,
  Credentials,
  getOlmOperators,
  MonitoredOperator,
  MonitoredOperatorsList,
  ClusterCredentials,
} from '../../../common';
import { getClusterDetailId } from './utils';
import { ClustersAPI } from '../../services/apis';
import ClusterDetailStatusMessages from './ClusterDetailStatusMessages';

type ClusterStatusVarieties = {
  credentials?: Credentials;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  credentialsError?: any;
  olmOperators: MonitoredOperatorsList;
  failedOlmOperators: MonitoredOperatorsList;
  consoleOperator?: MonitoredOperator;
  fetchCredentials: () => void;
};

export const useClusterStatusVarieties = (cluster: Cluster): ClusterStatusVarieties => {
  const [credentials, setCredentials] = React.useState<Credentials>();
  const [credentialsError, setCredentialsError] = React.useState();

  const olmOperators = getOlmOperators(cluster.monitoredOperators);
  const failedOlmOperators = olmOperators.filter((o) => o.status === 'failed');
  const consoleOperator = React.useMemo(
    () => cluster.monitoredOperators?.find((o) => o.name === 'console'),
    [cluster.monitoredOperators],
  );

  const fetchCredentials = React.useCallback(() => {
    const fetch = async () => {
      setCredentialsError(undefined);
      try {
        const response = await ClustersAPI.getCredentials(cluster.id);
        setCredentials(response.data);
      } catch (err) {
        setCredentialsError(err);
      }
    };
    fetch();
  }, [cluster.id]);

  const consoleOperatorStatus = consoleOperator?.status;
  React.useEffect(() => {
    if (
      (!consoleOperatorStatus && cluster.status === 'installed') || // Retain backwards compatibility with clusters which don't have monitored clusters
      consoleOperatorStatus === 'available'
    ) {
      fetchCredentials();
    }
  }, [cluster.status, consoleOperatorStatus, fetchCredentials]);

  return {
    credentials,
    credentialsError,
    olmOperators,
    failedOlmOperators,
    consoleOperator,
    fetchCredentials,
  };
};

const ClusterDetailStatusVarieties: React.FC<{
  cluster: Cluster;
  clusterVarieties: ClusterStatusVarieties;
}> = ({ cluster, clusterVarieties }) => {
  const { credentials, credentialsError, consoleOperator, fetchCredentials } = clusterVarieties;

  const showClusterCredentials =
    consoleOperator?.status === 'available' || (!consoleOperator && cluster.status === 'installed'); // Retain backwards compatibility with clusters which don't have monitored clusters

  return (
    <>
      {showClusterCredentials && (
        <ClusterCredentials
          cluster={cluster}
          credentials={credentials}
          error={!!credentialsError}
          retry={fetchCredentials}
          idPrefix={getClusterDetailId('cluster-creds')}
        />
      )}
      <ClusterDetailStatusMessages cluster={cluster} />
    </>
  );
};

export default ClusterDetailStatusVarieties;
