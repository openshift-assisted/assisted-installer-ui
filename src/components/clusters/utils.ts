import { Cluster, LogsState, OperatorCreateParams } from '../../api/types';
import { OpenshiftVersionOptionType } from '../../types/versions';

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

export const getNormalizedClusterVersion = (
  openShiftVersions: OpenshiftVersionOptionType[],
  version = '',
): string =>
  openShiftVersions.map((obj) => obj.value).find((normalized) => version.startsWith(normalized)) ||
  version;

export const getOpenShiftVersionLabel = (
  openShiftVersions: OpenshiftVersionOptionType[],
  versionValue = '',
) => openShiftVersions.find((v) => v.value === versionValue)?.label || versionValue;

export const getDefaultOpenShiftVersion = (openShiftVersions: OpenshiftVersionOptionType[]) =>
  // TODO(jtomasek): one of the available versions should be flagged as a default
  // from the server so we don't have to hardcode here
  // https://issues.redhat.com/browse/MGMT-4363
  openShiftVersions.find((v) => v.value === '4.7')?.value || openShiftVersions[0]?.value || '';
