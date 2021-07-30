import { Cluster } from '../../common';

export type ClusterCIMExtended = Cluster & {
  agentSelectorMasterLabels?: { [key in string]: string };
  agentSelectorWorkerLabels?: { [key in string]: string };
};
