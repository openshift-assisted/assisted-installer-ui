import { OpenshiftVersionOptionType } from '../../types/versions';
import { ClusterDetailsValues } from '../clusterWizard/types';

export type ClusterDeploymentDetailsProps = {
  defaultPullSecret: string;
  ocpVersions: OpenshiftVersionOptionType[];
};

// TODO(mlibra): expose other steps
export type ClusterDeploymentWizardProps = ClusterDeploymentDetailsProps & {
  className?: string;
  onClusterCreate: (params: ClusterDeploymentWizardValues) => Promise<void>;
  onClose: () => void;
  usedClusterNames: string[];
};

export type ClusterDeploymentWizardValues = ClusterDetailsValues & {
  /* TODO(mlibra): other steps */
};
