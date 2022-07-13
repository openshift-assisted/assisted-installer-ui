import React from 'react';
import {
  Cluster,
  Credentials,
  selectOlmOperators,
  selectMonitoredOperators,
  MonitoredOperator,
  MonitoredOperatorsList,
  ClusterCredentials,
} from '../../../common';
import { getClusterDetailId } from './utils';
import { ClustersAPI } from '../../services/apis';
import ClusterDetailStatusMessages from './ClusterDetailStatusMessages';
import { Grid } from '@patternfly/react-core';
import { getErrorMessage } from '../../../common/utils';

type ClusterStatusVarieties = {
  credentials?: Credentials;
  credentialsError: string;
  olmOperators: MonitoredOperatorsList;
  failedOlmOperators: MonitoredOperatorsList;
  consoleOperator?: MonitoredOperator;
  fetchCredentials: () => void;
};

export const useClusterStatusVarieties = (cluster?: Cluster): ClusterStatusVarieties => {
  const [credentials, setCredentials] = React.useState<Credentials>();
  const [credentialsError, setCredentialsError] = React.useState('');

  const clusterId = cluster?.id;
  const clusterStatus = cluster?.status;
  const clusterMonitoredOperators = selectMonitoredOperators(cluster);
  const olmOperators = selectOlmOperators(cluster);
  const failedOlmOperators = olmOperators.filter((o) => o.status === 'failed');
  const consoleOperator = React.useMemo(
    () => clusterMonitoredOperators.find((o) => o.name === 'console'),
    [clusterMonitoredOperators],
  );

  const fetchCredentials = React.useCallback(() => {
    const fetch = async () => {
      setCredentialsError('');
      if (!clusterId) {
        return;
      }
      try {
        const response = await ClustersAPI.getCredentials(clusterId);
        setCredentials(response.data);
      } catch (err) {
        setCredentialsError(getErrorMessage(err));
      }
    };
    void fetch();
  }, [clusterId]);

  const consoleOperatorStatus = consoleOperator?.status;
  React.useEffect(() => {
    if (
      (!consoleOperatorStatus && clusterStatus === 'installed') || // Retain backwards compatibility with clusters which don't have monitored clusters
      consoleOperatorStatus === 'available'
    ) {
      fetchCredentials();
    }
  }, [clusterStatus, consoleOperatorStatus, fetchCredentials]);

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
  showAddHostsInfo?: boolean;
}> = ({ cluster, clusterVarieties, showAddHostsInfo = true }) => {
  const { credentials, credentialsError, consoleOperator, fetchCredentials } = clusterVarieties;

  const showClusterCredentials =
    consoleOperator?.status === 'available' || (!consoleOperator && cluster.status === 'installed'); // Retain backwards compatibility with clusters which don't have monitored clusters

  return (
    <Grid hasGutter>
      {showClusterCredentials && (
        <ClusterCredentials
          cluster={cluster}
          credentials={credentials}
          error={!!credentialsError}
          retry={fetchCredentials}
          idPrefix={getClusterDetailId('cluster-creds')}
        />
      )}
      <ClusterDetailStatusMessages cluster={cluster} showAddHostsInfo={showAddHostsInfo} />
    </Grid>
  );
};

export default ClusterDetailStatusVarieties;
