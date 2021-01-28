import { Cluster } from '../../api';

export type ClusterWizardStepsType =
  | 'cluster-details'
  | 'baremetal-discovery'
  | 'networking'
  | 'review';

export const CLUSTER_WIZARD_FIRST_STEP: ClusterWizardStepsType = 'cluster-details';

// We are collocating all these canNext* functions for easier maintenance.
// However they should be independent on each other anyway.
type TransitionBackendProps = { cluster: Cluster };
type TransitionProps = TransitionBackendProps & { isValid?: boolean; isSubmitting?: boolean };

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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const canNextBaremetalDiscovery = ({ cluster }: TransitionProps) => {
  // TODO(jtomasek): ensure that there are no hardware validations failing
  // on any of the host, ensure that selected cluster validations are passing
  return true;
};
