import {
  Cluster,
  selectOlmOperators,
  LogsState,
  MonitoredOperator,
  MonitoredOperatorsList,
  OperatorCreateParams,
} from '../../../common';

// The Day2 cluster
export const isAddHostsCluster = (cluster: Cluster) => cluster.kind === 'AddHostsCluster';

export const filterHostsByLogStates = (cluster: Cluster, logStates: LogsState[]) =>
  cluster.hosts?.filter(({ logsInfo }) => logsInfo && logStates.includes(logsInfo)) || [];

export const calculateCollectedLogsCount = (cluster: Cluster) => {
  const collectedLogStates: LogsState[] = ['completed', 'timeout'];
  const clusterHasCollectedLogs = cluster.logsInfo && collectedLogStates.includes(cluster.logsInfo);
  const hostsWithCollectedLogsCount = filterHostsByLogStates(cluster, collectedLogStates).length;

  return (clusterHasCollectedLogs ? 1 : 0) + hostsWithCollectedLogsCount;
};

export const getBuiltInOperators = (monitoredOperators: MonitoredOperatorsList = []) =>
  monitoredOperators.filter((operator: MonitoredOperator) => operator.operatorType === 'builtin');

export const getOlmOperatorCreateParams = (cluster?: Cluster): OperatorCreateParams[] =>
  selectOlmOperators(cluster).map((operator) => ({
    name: operator.name,
    properties: operator.properties,
  }));

export const getOlmOperatorCreateParamsByName = (cluster?: Cluster) =>
  getOlmOperatorCreateParams(cluster).reduce(
    (result: { [key: string]: OperatorCreateParams }, operator) => {
      if (operator.name) {
        result[operator.name] = operator;
      }
      return result;
    },
    {},
  );

export const canAbortInstallation = (cluster: Cluster) => {
  const allowedClusterStates: Cluster['status'][] = [
    'preparing-for-installation',
    'installing',
    'installing-pending-user-action',
    'finalizing',
  ];
  return allowedClusterStates.includes(cluster.status);
};

export const isSomeDisksSkipFormatting = (cluster: Cluster) => {
  return cluster.hosts?.some(
    (host) => host.skipFormattingDisks && host.skipFormattingDisks.length > 0,
  );
};
