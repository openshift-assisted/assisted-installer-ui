import { Cluster } from '../../api';
import { OpenshiftVersionOptionType } from '../../types';
import { ClusterDetailsValues } from '../clusterWizard/types';

export type ClusterDeploymentDetailsProps = {
  defaultPullSecret: string;
  ocpVersions: OpenshiftVersionOptionType[];
  cluster?: Cluster; // TODO(mlibra): isn't it generic even for other steps??
};

// TODO(mlibra): expose other steps
export type ClusterDeploymentWizardProps = ClusterDeploymentDetailsProps & {
  className?: string;
  usedClusterNames: string[];

  onClusterSave: (params: ClusterDeploymentWizardValues) => Promise<void>;
  onClose: () => void;
};

export type ClusterDeploymentWizardValues = ClusterDetailsValues & {
  /* TODO(mlibra): other steps */
};
