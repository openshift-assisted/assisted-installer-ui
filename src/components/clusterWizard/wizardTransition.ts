import _ from 'lodash';
import { Cluster, ClusterValidationId, HostValidationId, stringToJSON } from '../../api';
import { ValidationsInfo as ClusterValidationsInfo } from '../../types/clusters';
import { ValidationsInfo as HostValidationsInfo } from '../../types/hosts';

/*
We are colocating all these canNext* functions for easier maintenance.
However they should be independent on each other anyway.
*/

export type ClusterWizardStepsType =
  | 'cluster-details'
  | 'baremetal-discovery'
  | 'networking'
  | 'review';

export const CLUSTER_WIZARD_FIRST_STEP: ClusterWizardStepsType = 'cluster-details';

type TransitionBackendProps = { cluster: Cluster };
type TransitionProps = TransitionBackendProps & { isValid?: boolean; isSubmitting?: boolean };

const checkClusterValidations = (
  clusterValidationsInfo: ClusterValidationsInfo,
  requiredIds: ClusterValidationId[],
): boolean => {
  const requiredValidations = _.values(clusterValidationsInfo)
    .flat()
    .filter((v) => v && requiredIds.includes(v.id));
  return (
    requiredValidations.length === requiredIds.length &&
    requiredValidations.every((v) => v?.status === 'success')
  );
};
const checkClusterValidationGroups = (
  clusterValidationsInfo: ClusterValidationsInfo,
  groups: ('hostsData' | 'network' | 'configuration')[],
) =>
  groups.every((group) =>
    clusterValidationsInfo[group]?.every((validation) => validation.status === 'success'),
  );

const checkHostValidations = (
  hostValidationsInfo: HostValidationsInfo,
  requiredIds: HostValidationId[],
): boolean => {
  const requiredValidations = _.values(hostValidationsInfo)
    .flat()
    .filter((v) => v && requiredIds.includes(v.id));

  return (
    requiredValidations.length === requiredIds.length &&
    requiredValidations.every((v) => v?.status === 'success')
  );
};

const checkHostValidationGroups = (
  hostValidationsInfo: HostValidationsInfo,
  groups: ('hardware' | 'network')[],
) =>
  groups.every((group) =>
    hostValidationsInfo[group]?.every((validation) => validation.status === 'success'),
  );

export const canNextClusterDetails = ({ cluster }: TransitionBackendProps): boolean => {
  const clusterValidationsInfo = stringToJSON<ClusterValidationsInfo>(cluster.validationsInfo);
  return !!(
    clusterValidationsInfo && checkClusterValidations(clusterValidationsInfo, ['pull-secret-set'])
  );
};

// Check backend validations relevant for the networking step.
// Since BaremetalDiscovery step is is not a UI form, we do not need frontend validation checks.
export const canNextBaremetalDiscovery = ({ cluster }: TransitionProps): boolean => {
  const clusterValidationsInfo = stringToJSON<ClusterValidationsInfo>(cluster.validationsInfo);
  if (!clusterValidationsInfo?.hostsData || !clusterValidationsInfo?.network) {
    return false;
  }

  // Cluster level: Selected hostsData and network validations must be passing
  if (
    !checkClusterValidations(clusterValidationsInfo, [
      'sufficient-masters-count',
      'ntp-server-configured',
    ])
  ) {
    return false;
  }

  // For every host
  return !!cluster.hosts?.every((host) => {
    const hostValidationsInfo = stringToJSON<HostValidationsInfo>(host.validationsInfo);
    if (!hostValidationsInfo?.hardware || !hostValidationsInfo.network) {
      return false;
    }

    // Selected network validations for every host must be passing
    if (
      !checkHostValidations(hostValidationsInfo, [
        'connected',
        'belongs-to-majority-group',
        'ntp-synced',
      ])
    ) {
      return false;
    }

    // All hardware validations for every host must be passing
    return checkHostValidationGroups(hostValidationsInfo, ['hardware']);
  });
};

// Check backend validations relevant for the networking step.
export const canNextNetworkBackend = ({ cluster }: TransitionBackendProps): boolean => {
  const clusterValidationsInfo = stringToJSON<ClusterValidationsInfo>(cluster.validationsInfo);
  if (!clusterValidationsInfo?.network) {
    return false;
  }

  // All network cluster validations must be passing
  if (!checkClusterValidationGroups(clusterValidationsInfo, ['network'])) {
    return false;
  }

  // All network validations for every host must be passing
  return !!cluster.hosts?.every((host) => {
    const hostValidationsInfo = stringToJSON<HostValidationsInfo>(host.validationsInfo);
    return hostValidationsInfo && checkHostValidationGroups(hostValidationsInfo, ['network']);
  });
};

export const canNextNetwork = ({ isValid, isSubmitting, cluster }: TransitionProps): boolean => {
  let uiValidation = true;
  if (isValid !== undefined) {
    uiValidation = isValid && !isSubmitting;
  }

  return uiValidation && canNextNetworkBackend({ cluster });
};
