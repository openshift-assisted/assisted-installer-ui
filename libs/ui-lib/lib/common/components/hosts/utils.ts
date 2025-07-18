import Fuse from 'fuse.js';
import { TFunction } from 'i18next';
import type {
  Host,
  Cluster,
  Inventory,
} from '@openshift-assisted/types/assisted-installer-service';
import { stringToJSON } from '../../utils';
import { hostRoles, TIME_ZERO } from '../../config';
import { DASH } from '../constants';
import {
  Validation,
  ValidationsInfo as HostValidationsInfo,
  ValidationGroup as HostValidationGroup,
} from '../../types/hosts';
import { isInOcm } from '../../api';

export const canEnable = (clusterStatus: Cluster['status'], status: Host['status']) =>
  ['pending-for-input', 'insufficient', 'ready', 'adding-hosts'].includes(clusterStatus) &&
  ['disabled', 'disabled-unbound'].includes(status);

export const canDisable = (clusterStatus: Cluster['status'], status: Host['status']) =>
  ['pending-for-input', 'insufficient', 'ready', 'adding-hosts'].includes(clusterStatus) &&
  [
    'discovering',
    'discovering-unbound',
    'disconnected',
    'disconnected-unbound',
    'known',
    'known-unbound',
    'insufficient',
    'insufficient-unbound',
    'pending-for-input',
  ].includes(status);

export const canDelete = (clusterStatus: Cluster['status'], status: Host['status']) =>
  ['pending-for-input', 'insufficient', 'ready', 'adding-hosts'].includes(clusterStatus) &&
  [
    'discovering',
    'discovering-unbound',
    'known',
    'known-unbound',
    'disconnected',
    'disconnected-unbound',
    'disabled',
    'disabled-unbound',
    'insufficient',
    'insufficient-unbound',
    'resetting',
    'resetting-pending-user-input',
    'resetting-pending-user-action',
    'installing-pending-user-action',
    'pending-for-input',
    'error',
  ].includes(status);

export const canReset = (clusterStatus: Cluster['status'], status: Host['status']) =>
  ['adding-hosts'].includes(clusterStatus) &&
  ['error', 'installing-pending-user-action'].includes(status);

export const canEditHost = (clusterStatus: Cluster['status'], status: Host['status']) =>
  ['pending-for-input', 'insufficient', 'ready', 'adding-hosts'].includes(clusterStatus) &&
  [
    'discovering',
    'discovering-unbound',
    'known',
    'known-unbound',
    'disconnected',
    'disconnected-unbound',
    'disabled',
    'disabled-unbound',
    'insufficient',
    'insufficient-unbound',
    'pending-for-input',
  ].includes(status);

export const canEditRole = (
  clusterStatus: Cluster['status'],
  status: Host['status'],
  isSNO?: boolean,
) => canEditHost(clusterStatus, status) && !isSNO;

export const canEditHostname = (clusterStatus: Cluster['status'], host?: Host) => {
  // First check if the cluster status allows hostname editing
  if (!['insufficient', 'adding-hosts', 'ready', 'pending-for-input'].includes(clusterStatus)) {
    return false;
  }

  // For Day2 hosts, also check the host status
  if (host && host.kind === 'AddToExistingClusterHost') {
    return canHostnameBeChanged(host.status);
  }

  return true;
};

export const canEditDisks = canEditHost;

export const canDownloadKubeconfig = (clusterStatus: Cluster['status']) =>
  ['installing', 'finalizing', 'error', 'cancelled', 'installed', 'adding-hosts'].includes(
    clusterStatus,
  );

export const canInstallHost = (cluster: Cluster, hostStatus: Host['status']) =>
  cluster.kind === 'AddHostsCluster' && cluster.status === 'adding-hosts' && hostStatus === 'known';

export const getHostStatus = (
  hostStatus: Host['status'],
  clusterStatus: Cluster['status'],
): Host['status'] | 'finalizing' => {
  if (isInOcm && hostStatus === 'installed' && clusterStatus !== 'installed') {
    return 'finalizing';
  }
  return hostStatus;
};

export const canOpenConsole = (clusterStatus: Cluster['status']) => {
  return ['finalizing', 'installed'].includes(clusterStatus);
};

export const getHostProgressStages = (host: Host) => host.progressStages || [];

export const getHostProgress = (host: Host) =>
  host.progress?.currentStage
    ? host.progress
    : {
        currentStage: 'Starting installation',
        progressInfo: undefined,
        installationPercentage: undefined,
      };

export const getHostProgressStageNumber = (host: Host) => {
  const stages = getHostProgressStages(host);
  const progress = getHostProgress(host);

  return Math.round(((progress?.installationPercentage || 0) / 100) * stages.length);
};

export const canHostnameBeChanged = (hostStatus: Host['status']) =>
  [
    'discovering',
    'discovering-unbound',
    'known',
    'known-unbound',
    'disconnected',
    'disconnected-unbound',
    'insufficient',
    'insufficient-unbound',
    'pending-for-input',
  ].includes(hostStatus);

export const getHostRole = (
  host: Host,
  t: TFunction,
  schedulableMasters?: boolean,
  clusterKind?: Cluster['kind'],
): string => {
  let roleLabel = `${
    hostRoles(t).find((role) => role.value === host.role)?.label || hostRoles(t)[0].label
  }`;

  if (schedulableMasters && host.role === 'master') {
    roleLabel =
      clusterKind === 'AddHostsCluster'
        ? t('ai:Control plane node')
        : t('ai:Control plane node, Worker');
  }
  return `${roleLabel}${host.bootstrap ? ' (bootstrap)' : ''}`;
};

export const canDownloadHostLogs = (host: Host) =>
  !!host.logsCollectedAt && host.logsCollectedAt !== TIME_ZERO;

export const canDownloadClusterLogs = (cluster: Cluster) =>
  cluster.controllerLogsCollectedAt !== TIME_ZERO ||
  !!(cluster.hosts || []).find((host) => canDownloadHostLogs(host));

export const getReadyHostCount = (cluster: Cluster) => cluster.readyHostCount || 0;
export const getEnabledHostCount = (cluster: Cluster) => cluster.enabledHostCount || 0;
export const getTotalHostCount = (cluster: Cluster) => cluster.totalHostCount || 0;

export const getEnabledHosts = (hosts: Host[] = []) =>
  hosts.filter((host) => host.status !== 'disabled');

export const getHostname = (host: Host, inventory: Inventory) =>
  host.requestedHostname || inventory.hostname || '';

export const getHardwareTypeText = (inventory: Inventory, t: TFunction) => {
  let hardwareTypeText = DASH;
  const { systemVendor } = inventory;

  if (systemVendor !== undefined) {
    if (systemVendor.virtual) {
      hardwareTypeText = t('ai:Virtual machine');
    } else {
      hardwareTypeText = t('ai:Bare metal');
    }
  }

  return hardwareTypeText;
};

export const getInventory = (host: Host) => {
  const { inventory: inventoryString = '' } = host;
  return stringToJSON<Inventory>(inventoryString) || {};
};

export const filterByHostname = (hosts: Host[], hostnameFilter: string | undefined) => {
  if (!hostnameFilter) {
    return hosts;
  }
  const hostsWithHostname = hosts.map((host) => {
    const { inventory: inventoryString = '' } = host;
    const inventory = stringToJSON<Inventory>(inventoryString) || {};
    const hostname = getHostname(host, inventory);
    return {
      hostname,
      host,
    };
  });

  const fuse = new Fuse(hostsWithHostname, {
    ignoreLocation: true,
    threshold: 0.3,
    keys: ['hostname'],
  });

  return fuse.search(hostnameFilter).map(({ item }) => item.host);
};

export const getFailingHostValidations = (validationsInfo: HostValidationsInfo) =>
  Object.keys(validationsInfo).reduce((curr, groupStr) => {
    const group = groupStr as HostValidationGroup;
    const failingValidations: Validation[] = (validationsInfo[group] as Validation[]).filter(
      (validation: Validation) => validation.status === 'failure',
    );
    return [...curr, ...failingValidations];
  }, [] as Validation[]);

export const areOnlySoftValidationsFailing = (validationsInfo: HostValidationsInfo) => {
  const failingValidationIds = getFailingHostValidations(validationsInfo).map(
    (validation) => validation.id,
  );
  if (!failingValidationIds.length) return false;
  for (const id of failingValidationIds) {
    if (!['ntp-synced', 'container-images-available', 'mtu-valid'].includes(id)) {
      return false;
    }
  }
  return true;
};
