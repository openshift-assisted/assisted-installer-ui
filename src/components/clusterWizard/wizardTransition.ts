import { Cluster } from '../../api';

export type ClusterWizardStepsType =
  | 'cluster-details'
  | 'baremetal-discovery'
  | 'networking'
  | 'cluster-configuration';

export const CLUSTER_WIZARD_FIRST_STEP: ClusterWizardStepsType = 'cluster-configuration';

// We are collocating all these canNext* functions for easier maintenance.
// However they should be independent on each other anyway.
type TransitionBackendProps = { cluster: Cluster };
type TransitionProps = TransitionBackendProps & { isValid?: boolean; isSubmitting?: boolean };

export const canNextClusterConfigurationBackend = ({ cluster }: TransitionBackendProps) => {
  // TODO(mlibra): check backend validations
  return !!cluster;
};

export const canNextClusterConfiguration = ({
  isValid,
  isSubmitting,
  cluster,
}: TransitionProps) => {
  let uiValidation = true;
  if (isValid !== undefined) {
    uiValidation = isValid && !isSubmitting;
  }

  return uiValidation && canNextClusterConfigurationBackend({ cluster });
};

export const canNextNetworkBackend = ({ cluster }: TransitionBackendProps) => {
  // TODO(mlibra): check backend validations
  return !!cluster;
};

export const canNextNetwork = ({ isValid, isSubmitting, cluster }: TransitionProps) => {
  let uiValidation = true;
  if (isValid !== undefined) {
    uiValidation = isValid && !isSubmitting;
  }

  return uiValidation && canNextNetworkBackend({ cluster });
};
