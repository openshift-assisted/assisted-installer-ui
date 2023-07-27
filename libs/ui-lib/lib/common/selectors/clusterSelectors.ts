import head from 'lodash-es/head.js';
import { SupportedPlatformIntegrations, ValidationsInfo } from '../types';
import { Cluster, Ip } from '../api';
import { ExposedOperatorName } from '../config';
import { stringToJSON } from '../utils';

export const selectMachineNetworkCIDR = ({
  machineNetworks,
  machineNetworkCidr,
}: Pick<Cluster, 'machineNetworks' | 'machineNetworkCidr'>) =>
  head(machineNetworks)?.cidr ?? machineNetworkCidr;

export const selectClusterNetworkCIDR = ({
  clusterNetworks,
  clusterNetworkCidr,
}: Pick<Cluster, 'clusterNetworks' | 'clusterNetworkCidr'>) =>
  head(clusterNetworks)?.cidr ?? clusterNetworkCidr;

export const selectClusterNetworkHostPrefix = ({
  clusterNetworks,
  clusterNetworkHostPrefix,
}: Pick<Cluster, 'clusterNetworks' | 'clusterNetworkHostPrefix'>) =>
  head(clusterNetworks)?.hostPrefix ?? clusterNetworkHostPrefix;

export const selectServiceNetworkCIDR = ({
  serviceNetworks,
  serviceNetworkCidr,
}: Pick<Cluster, 'serviceNetworks' | 'serviceNetworkCidr'>) =>
  head(serviceNetworks)?.cidr ?? serviceNetworkCidr;

export const selectApiVip = ({ apiVips }: Pick<Cluster, 'apiVips'>): Ip => head(apiVips)?.ip || '';

export const selectIngressVip = ({ ingressVips }: Pick<Cluster, 'ingressVips'>): Ip =>
  head(ingressVips)?.ip || '';

export const selectMonitoredOperators = (monitoredOperators: Cluster['monitoredOperators']) => {
  // monitoredOperators can sometimes be either undefined or also null, we must use the fallback
  return monitoredOperators || [];
};

export const selectOlmOperators = (cluster?: Pick<Cluster, 'monitoredOperators'>) => {
  return selectMonitoredOperators(cluster?.monitoredOperators).filter(
    (operator) => operator.operatorType === 'olm',
  );
};

export const hasEnabledOperators = (
  monitoredOperators: Cluster['monitoredOperators'],
  searchOperator: ExposedOperatorName,
) => {
  return selectMonitoredOperators(monitoredOperators).some(
    (operator) => operator.name && operator.name === searchOperator,
  );
};

export const isCompact = (cluster: Pick<Cluster, 'hosts'>) => {
  return !cluster.hosts || cluster.hosts.length <= 3;
};

export const isSNO = ({ highAvailabilityMode }: Partial<Cluster>) =>
  highAvailabilityMode === 'None';

export const selectClusterValidationsInfo = ({
  validationsInfo,
}: Pick<Cluster, 'validationsInfo'>) => {
  return stringToJSON<ValidationsInfo>(validationsInfo);
};

export const selectIpv4Cidr = (
  {
    machineNetworks,
    serviceNetworks,
    clusterNetworks,
  }: Pick<Cluster, 'machineNetworks' | 'clusterNetworks' | 'serviceNetworks'>,
  key: 'machineNetworks' | 'serviceNetworks' | 'clusterNetworks',
) => {
  switch (key) {
    case 'machineNetworks':
      return head(machineNetworks)?.cidr;
    case 'clusterNetworks':
      return head(clusterNetworks)?.cidr;
    case 'serviceNetworks':
      return head(serviceNetworks)?.cidr;
  }
};

export const selectIpv6Cidr = (
  {
    machineNetworks,
    serviceNetworks,
    clusterNetworks,
  }: Pick<Cluster, 'machineNetworks' | 'clusterNetworks' | 'serviceNetworks'>,
  key: 'machineNetworks' | 'serviceNetworks' | 'clusterNetworks',
) => {
  switch (key) {
    case 'machineNetworks':
      return machineNetworks && machineNetworks[1].cidr;
    case 'clusterNetworks':
      return clusterNetworks && clusterNetworks[1].cidr;
    case 'serviceNetworks':
      return serviceNetworks && serviceNetworks[1].cidr;
  }
};

export const selectIpv4HostPrefix = ({ clusterNetworks }: Pick<Cluster, 'clusterNetworks'>) =>
  head(clusterNetworks)?.hostPrefix;

export const selectIpv6HostPrefix = ({ clusterNetworks }: Pick<Cluster, 'clusterNetworks'>) =>
  clusterNetworks && clusterNetworks[1].hostPrefix;

export const selectMastersMustRunWorkloads = (cluster: Cluster): boolean =>
  !!cluster.schedulableMastersForcedTrue;

export const selectSchedulableMasters = (cluster: Cluster): boolean => {
  if (selectMastersMustRunWorkloads(cluster)) {
    return true;
  }
  return cluster.schedulableMasters || false;
};

export const isClusterPlatformTypeVM = ({ platform }: Pick<Cluster, 'platform'>) =>
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  SupportedPlatformIntegrations.includes(platform?.type ?? 'none');
