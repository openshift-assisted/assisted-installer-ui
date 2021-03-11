import { Cluster } from '../../api/types';

export const isSingleNodeCluster = (cluster: Cluster) => cluster.highAvailabilityMode === 'None';
