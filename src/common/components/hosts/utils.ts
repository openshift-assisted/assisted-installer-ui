import filesize from 'filesize.js';
import Fuse from 'fuse.js';
import { Host, Cluster, Inventory } from '../../api/types';
import { HOST_ROLES, TIME_ZERO } from '../../config';
import { DASH } from '../constants';
import { stringToJSON } from '../../api';
import { isSNO } from '../../selectors';
import { Validation, ValidationsInfo as HostValidationsInfo } from '../../types/hosts';

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
    'added-to-existing-cluster',
    'error',
  ].includes(status);

export const canReset = (clusterStatus: Cluster['status'], status: Host['status']) =>
  ['adding-hosts'].includes(clusterStatus) &&
  ['error', 'installing-pending-user-action'].includes(status);

export const canEditRole = (cluster: Cluster): boolean => !isSNO(cluster);

export const canEditHost = (clusterStatus: Cluster['status'], status: Host['status']) =>
  ['pending-for-input', 'insufficient', 'ready'].includes(clusterStatus) &&
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

export const canEditHostname = (clusterStatus: Cluster['status']) =>
  ['insufficient', 'adding-hosts', 'ready', 'pending-for-input'].includes(clusterStatus);

export const canEditDisks = canEditHost;

export const canDownloadKubeconfig = (clusterStatus: Cluster['status']) =>
  ['installing', 'finalizing', 'error', 'cancelled', 'installed', 'adding-hosts'].includes(
    clusterStatus,
  );

export const canInstallHost = (cluster: Cluster, hostStatus: Host['status']) =>
  cluster.kind === 'AddHostsCluster' && cluster.status === 'adding-hosts' && hostStatus === 'known';

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

export const getHostRoleLabel = (host: Host, schedulableMasters?: boolean): string => {
  // suggestedRole can be "master", "worker" or "auto-assign"
  const effectiveRole = host.role === 'auto-assign' ? host.suggestedRole : host.role;
  let item = HOST_ROLES.find((hostRole) => {
    if (hostRole.value !== effectiveRole) {
      return false;
    }
    if (schedulableMasters) {
      return ['on', 'any'].includes(hostRole.schedulable_policy);
    } else {
      return ['off', 'any'].includes(hostRole.schedulable_policy);
    }
  });

  if (!item) {
    // role / suggested_role should always be set, but we can get here if we receive unexepected values from BE.
    // eg. "auto-assign" right after discovery, "bootstrap" after a cluster started installing
    item = HOST_ROLES[0];
  }
  return `${item.label}${host.bootstrap ? ' (bootstrap)' : ''}`;
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

export const getHardwareTypeText = (inventory: Inventory) => {
  let hardwareTypeText = DASH;
  const { systemVendor } = inventory;

  if (systemVendor !== undefined) {
    if (systemVendor.virtual) {
      hardwareTypeText = 'Virtual machine';
    } else {
      hardwareTypeText = 'Bare metal';
    }
  }

  return hardwareTypeText;
};

export const fileSize: typeof filesize = (...args) =>
  filesize
    .call(null, ...args)
    .toUpperCase()
    .replace(/I/, 'i');

export const schedulableMastersAlwaysOn = (cluster: Cluster) => {
  return cluster.hosts ? cluster.hosts.length < 5 : true;
};

export const getSchedulableMasters = (cluster: Cluster): boolean => {
  if (schedulableMastersAlwaysOn(cluster)) {
    return true;
  }
  return !!cluster.schedulableMasters;
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
    keys: ['hostname'],
  });
  return fuse.search(hostnameFilter).map(({ item }) => item.host);
};

export const getFailingHostValidations = (validationsInfo: HostValidationsInfo) =>
  Object.keys(validationsInfo).reduce((curr, group) => {
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
    if (!['ntp-synced', 'container-images-available'].includes(id)) {
      return false;
    }
  }
  return true;
};
