import { Cluster } from '../../api';
import { OpenshiftVersionOptionType } from '../../types';
import { ClusterDetailsValues } from '../clusterWizard/types';

export type ClusterDeploymentWizardStepsType = 'cluster-details' | 'todo';

export type ClusterDeploymentDetailsProps = {
  defaultPullSecret: string;
  ocpVersions: OpenshiftVersionOptionType[];
  cluster?: Cluster;
  usedClusterNames: string[];
};

export type ClusterDeploymentDetailsValues = ClusterDetailsValues;

export type ClusterDeploymentDetailsStepProps = ClusterDeploymentDetailsProps & {
  onSaveDetails: (values: ClusterDeploymentDetailsValues) => Promise<string | void>;
  onClose: () => void;
};

export type ClusterDeploymentWizardProps = ClusterDeploymentDetailsProps & {
  className?: string;

  onClose: () => void;
  onSaveDetails: ClusterDeploymentDetailsStepProps['onSaveDetails'];
  // onClusterSave: (params: ClusterDeploymentWizardValues) => Promise<void>;
};
