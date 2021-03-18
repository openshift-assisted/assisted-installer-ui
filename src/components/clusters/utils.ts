import { Cluster, LogsState, OperatorCreateParams } from '../../api/types';

export const isSingleNodeCluster = (cluster: Cluster) => cluster.highAvailabilityMode === 'None';

export const filterHostsByLogStates = (cluster: Cluster, logStates: LogsState[]) =>
  cluster.hosts?.filter(({ logsInfo }) => logsInfo && logStates.includes(logsInfo)) || [];

export const calculateCollectedLogsCount = (cluster: Cluster) => {
  const collectedLogStates: LogsState[] = ['completed', 'timeout'];
  const clusterHasCollectedLogs = cluster.logsInfo && collectedLogStates.includes(cluster.logsInfo);
  const hostsWithCollectedLogsCount = filterHostsByLogStates(cluster, collectedLogStates).length;

  return (clusterHasCollectedLogs ? 1 : 0) + hostsWithCollectedLogsCount;
};

export const getOlmOperators = (cluster: Cluster) =>
  (cluster.monitoredOperators || [])
    .filter((op) => op.operatorType !== 'builtin')
    .map((op) => ({ name: op.name, properties: op.properties }));

export const getOlmOperatorsByName = (cluster: Cluster): { [key: string]: OperatorCreateParams } =>
  getOlmOperators(cluster).reduce((result, operator) => {
    if (operator.name) {
      result[operator.name] = operator;
    }
    return result;
  }, {});
