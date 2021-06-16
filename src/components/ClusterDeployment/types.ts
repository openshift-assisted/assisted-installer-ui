import { Cluster } from '../../api';
import { OpenshiftVersionOptionType } from '../../types';
import { NetworkConfigurationValues } from '../../types/clusters';
import { ClusterDetailsValues } from '../clusterWizard/types';
import { ClusterDeploymentHostsTablePropsActions } from './ClusterDeploymentHostsTable';

export type ClusterDeploymentWizardStepsType = 'cluster-details' | 'networking';

export type ClusterDeploymentDetailsProps = {
  defaultPullSecret: string;
  ocpVersions: OpenshiftVersionOptionType[];
  cluster?: Cluster;
  usedClusterNames: string[];
};

export type ClusterDeploymentDetailsValues = ClusterDetailsValues;

export type ClusterDeploymentNetworkingValues = NetworkConfigurationValues;

export type ClusterDeploymentDetailsStepProps = ClusterDeploymentDetailsProps & {
  onSaveDetails: (values: ClusterDeploymentDetailsValues) => Promise<string | void>;
  onClose: () => void;
};

export type ClusterDeploymentDetailsNetworkingProps = {
  cluster: Cluster;

  onSaveNetworking: (values: ClusterDeploymentNetworkingValues) => Promise<string | void>;
  onClose: () => void;
} & ClusterDeploymentHostsTablePropsActions;

export type ClusterDeploymentWizardProps = ClusterDeploymentDetailsProps & {
  className?: string;

  onClose: () => void;
  onSaveDetails: ClusterDeploymentDetailsStepProps['onSaveDetails'];
  onSaveNetworking: ClusterDeploymentDetailsNetworkingProps['onSaveNetworking'];
} & ClusterDeploymentHostsTablePropsActions;
