import { Host, Cluster } from '../../api/types';

export const canEditRole = (clusterStatus: Cluster['status'], status: Host['status']) =>
  ['insufficient', 'ready'].includes(clusterStatus) &&
  ['discovering', 'known', 'disconnected', 'disabled', 'insufficient'].includes(status);
