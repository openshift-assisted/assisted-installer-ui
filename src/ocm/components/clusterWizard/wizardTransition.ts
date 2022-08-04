import { Cluster } from '../../../common/api/types';
import {
  getAllClusterWizardSoftValidationIds,
  getWizardStepClusterStatus,
  WizardStepsValidationMap,
  WizardStepValidationMap,
} from '../../../common/components/clusterWizard/validationsInfoUtils';
import { StaticIpInfo, StaticIpView } from '../clusterConfiguration/staticIp/data/dataTypes';

export type ClusterWizardStepsType =
  | 'cluster-details'
  | 'static-ip-yaml-view'
  | 'static-ip-network-wide-configurations'
  | 'static-ip-host-configurations'
  | 'host-discovery'
  | 'storage'
  | 'networking'
  | 'review';
export type ClusterWizardFlowStateType = Cluster['status'] | 'new';

export const getClusterWizardFirstStep = (
  staticIpInfo: StaticIpInfo | undefined,
  state?: ClusterWizardFlowStateType,
): ClusterWizardStepsType => {
  if (staticIpInfo && !staticIpInfo.isDataComplete) {
    if (staticIpInfo.view === StaticIpView.YAML) {
      return 'static-ip-yaml-view';
    }
    return 'static-ip-network-wide-configurations';
  }
  switch (state) {
    case 'ready':
      return 'review';
    case 'pending-for-input':
    case 'adding-hosts':
    case 'insufficient':
      return 'host-discovery';
    default:
      return 'cluster-details';
  }
};

type TransitionProps = { cluster: Cluster };

const staticIpValidationsMap: WizardStepValidationMap = {
  cluster: {
    groups: [],
    validationIds: [],
  },
  host: {
    allowedStatuses: [],
    groups: [],
    validationIds: [],
  },
  softValidationIds: [],
};

const clusterDetailsStepValidationsMap: WizardStepValidationMap = {
  cluster: {
    groups: [],
    validationIds: ['pull-secret-set', 'dns-domain-defined'],
  },
  host: {
    allowedStatuses: [],
    groups: [],
    validationIds: [],
  },
  softValidationIds: [],
};

const hostDiscoveryStepValidationsMap: WizardStepValidationMap = {
  cluster: {
    groups: [],
    validationIds: [
      'sufficient-masters-count',
      'odf-requirements-satisfied',
      'lso-requirements-satisfied',
      'cnv-requirements-satisfied',
    ],
  },
  host: {
    allowedStatuses: ['known', 'disabled'],
    groups: ['hardware'],
    validationIds: [
      'connected',
      'media-connected',
      'odf-requirements-satisfied',
      'lso-requirements-satisfied',
      'cnv-requirements-satisfied',
    ],
  },
  softValidationIds: [],
};

const storageStepValidationsMap: WizardStepValidationMap = {
  cluster: {
    groups: [],
    validationIds: ['sufficient-masters-count'],
  },
  host: {
    allowedStatuses: ['known', 'disabled'],
    groups: ['hardware'],
    validationIds: ['connected', 'media-connected'],
  },
  softValidationIds: [],
};

const networkingStepValidationsMap: WizardStepValidationMap = {
  cluster: {
    groups: ['network'],
    validationIds: [],
  },
  host: {
    allowedStatuses: ['known', 'disabled'],
    groups: ['network'],
    validationIds: [],
  },
  // TODO(jtomasek): container-images-available validation is currently not running on the backend, it stays in pending.
  // marking it as soft validation is the easy way to prevent it from blocking the progress.
  // Alternatively we would have to whitelist network validations instead of using group
  // TODO(mlibra): remove that container-images-available from soft validations and let backend drive it via disabling it.
  //   Depends on: https://issues.redhat.com/browse/MGMT-5265
  softValidationIds: ['ntp-synced', 'container-images-available'],
};

const reviewStepValidationsMap: WizardStepValidationMap = {
  cluster: {
    groups: [],
    validationIds: ['all-hosts-are-ready-to-install'],
  },
  host: {
    allowedStatuses: ['known', 'disabled'],
    groups: [],
    validationIds: [],
  },
  softValidationIds: [],
};

export const wizardStepsValidationsMap: WizardStepsValidationMap<ClusterWizardStepsType> = {
  'cluster-details': clusterDetailsStepValidationsMap,
  'static-ip-yaml-view': staticIpValidationsMap,
  'static-ip-network-wide-configurations': staticIpValidationsMap,
  'static-ip-host-configurations': staticIpValidationsMap,
  'host-discovery': hostDiscoveryStepValidationsMap,
  storage: storageStepValidationsMap,
  networking: networkingStepValidationsMap,
  review: reviewStepValidationsMap,
};

export const allClusterWizardSoftValidationIds =
  getAllClusterWizardSoftValidationIds(wizardStepsValidationsMap);

/*
We are colocating all these canNext* functions for easier maintenance.
However transitions among steps should be independent on each other.
*/
export const canNextClusterDetails = ({ cluster }: TransitionProps): boolean =>
  getWizardStepClusterStatus(
    'cluster-details',
    wizardStepsValidationsMap,
    cluster,
    cluster.hosts,
  ) === 'ready';

export const canNextHostDiscovery = ({ cluster }: TransitionProps): boolean =>
  getWizardStepClusterStatus(
    'host-discovery',
    wizardStepsValidationsMap,
    cluster,
    cluster.hosts,
  ) === 'ready';

export const canNextStorage = ({ cluster }: TransitionProps): boolean =>
  getWizardStepClusterStatus('storage', wizardStepsValidationsMap, cluster, cluster.hosts) ===
  'ready';

export const canNextNetwork = ({ cluster }: TransitionProps): boolean =>
  getWizardStepClusterStatus('networking', wizardStepsValidationsMap, cluster, cluster.hosts) ===
  'ready';

export const isStaticIpStep = (stepId: ClusterWizardStepsType) => {
  return stepId.startsWith('static-ip');
};
