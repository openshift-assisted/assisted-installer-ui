import { ClusterCreateParams } from '../../api';
import { OpenshiftVersionOptionType } from '../../types';

export type ClusterDeploymentDetailsProps = {
  onClusterCreate: (params: ClusterCreateParams) => Promise<void>;

  pullSecret: string;
  ocpVersions: OpenshiftVersionOptionType[];
  usedClusterNames: string[];
};

export type ClusterDeploymentWizardProps = ClusterDeploymentDetailsProps & {
  /* TODO: expose other steps */
};

export type ClusterDeploymentWizardStepsType = 'cluster-details' | 'todo-next-wizard-step-id';
