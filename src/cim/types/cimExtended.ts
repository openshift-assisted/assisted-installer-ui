import { Cluster } from '../../common';

export type ClusterCIMExtended = Cluster & {
  agentSelectorLabels?: { [key in string]: string };
};
