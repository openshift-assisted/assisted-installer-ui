import {
  Cluster,
  ClusterValidationId,
  Host,
  HostValidationId,
} from '@openshift-assisted/types/assisted-installer-service';
import {
  getAllClusterWizardSoftValidationIds,
  getWizardStepClusterStatus,
  isWizardStepAwaitingValidations,
  WizardStepsValidationMap,
  WizardStepValidationMap,
} from '../../../common/components/clusterWizard/validationsInfoUtils';
import { Day2WizardStepsType } from '../AddHosts/day2Wizard/constants';
import { StaticIpInfo, StaticIpView } from '../clusterConfiguration/staticIp/data/dataTypes';
import {
  ValidationsInfo as HostValidationsInfo,
  Validation as HostValidation,
} from '../../../common/types/hosts';
import { getKeys, stringToJSON } from '../../../common/utils';
import { Validation, ValidationsInfo } from '../../../common';

type ValidationId = ClusterValidationId | HostValidationId;

export type ClusterWizardStepsType =
  | 'cluster-details'
  | 'static-ip-yaml-view'
  | 'static-ip-network-wide-configurations'
  | 'static-ip-host-configurations'
  | 'operators'
  | 'host-discovery'
  | 'storage'
  | 'networking'
  | 'review'
  | 'custom-manifests'
  | 'credentials-download'
  | 'disconnected-basic'
  | 'disconnected-review';

const wizardStepsOrder: ClusterWizardStepsType[] = [
  'cluster-details',
  'static-ip-yaml-view',
  'static-ip-network-wide-configurations',
  'static-ip-host-configurations',
  'operators',
  'host-discovery',
  'storage',
  'networking',
  'custom-manifests',
  'credentials-download',
  'review',
];

export const disconnectedSteps: ClusterWizardStepsType[] = [
  'disconnected-basic',
  'disconnected-review',
];

export const ClusterWizardFlowStateNew = 'new';
export type ClusterWizardFlowStateType = Cluster['status'] | typeof ClusterWizardFlowStateNew;

export const isStepAfter = (stepA: ClusterWizardStepsType, stepB: ClusterWizardStepsType) => {
  const indexA = wizardStepsOrder.findIndex((step) => step === stepA);
  const indexB = wizardStepsOrder.findIndex((step) => step === stepB);
  if (indexA === -1 || indexB === -1) {
    return false; // Missing step in "wizardStepsOrder"
  }

  return indexA > indexB;
};

export const getClusterWizardFirstStep = (
  locationState: ClusterWizardFlowStateType | undefined,
  staticIpInfo: StaticIpInfo | undefined,
  state?: ClusterWizardFlowStateType,
  cluster?: Cluster,
): ClusterWizardStepsType => {
  // Just for the first time when the cluster is created
  if (locationState === ClusterWizardFlowStateNew && !staticIpInfo) {
    return 'operators';
  }

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
      return getStepForFailingValidations(cluster);
    default:
      return 'cluster-details';
  }
};

const MINIMUM_STEP = 'host-discovery';
const getStepForFailingValidations = (cluster?: Cluster) => {
  // test host validations first, then cluster validations
  const failingValidations: Set<ValidationId> = new Set<ValidationId>([
    ...getHostFailingValidationIds(cluster?.hosts),
    ...getClusterFailingValidationIds(cluster),
  ]);

  let step;
  for (const failingValidationId of failingValidations) {
    step = findValidationStep(failingValidationId, wizardStepsValidationsMap);
    if (step !== undefined) {
      break;
    }
  }
  return step || MINIMUM_STEP;
};

const getHostFailingValidationIds = (hosts?: Host[]): Set<ValidationId> => {
  const failingValidations = new Set<HostValidationId>();
  hosts?.forEach((host) => {
    const validationsInfo = stringToJSON<HostValidationsInfo>(host.validationsInfo) || {};
    getKeys(validationsInfo).forEach((group) => {
      const f: (validation: HostValidation) => void = (validation) => {
        if (validation.status === 'failure') {
          failingValidations.add(validation.id);
        }
      };
      const validationGroup = validationsInfo[group] as HostValidation[];
      validationGroup.forEach(f);
    });
  });
  return failingValidations;
};

const getClusterFailingValidationIds = (cluster?: Cluster): Set<ValidationId> => {
  const failingValidations = new Set<ValidationId>();
  const validationsInfo = stringToJSON<ValidationsInfo>(cluster?.validationsInfo) || {};

  getKeys(validationsInfo).forEach((group) => {
    const f: (validation: Validation) => void = (validation) => {
      if (validation.status === 'failure') {
        failingValidations.add(validation.id);
      }
    };
    const validationGroup = validationsInfo[group] as Validation[];
    validationGroup.forEach(f);
  });
  return failingValidations;
};

const findValidationStep = (
  validationId: ValidationId,
  wizardStepsValidationsMap: WizardStepsValidationMap<ClusterWizardStepsType>,
): ClusterWizardStepsType | undefined => {
  let isBeforeMinimumStep = true;

  return wizardStepsOrder.find((wizardStepId) => {
    if (wizardStepId === MINIMUM_STEP) {
      isBeforeMinimumStep = false;
    }
    if (isBeforeMinimumStep) {
      return false;
    }

    // find first matching validation-map name, ignoring steps before minimumStep
    const { host: hostValidationMap, cluster: clusterValidationMap } =
      wizardStepsValidationsMap[wizardStepId];

    return (
      hostValidationMap.validationIds.includes(validationId as HostValidationId) ||
      clusterValidationMap.validationIds.includes(validationId as ClusterValidationId)
    );
  });
};

type TransitionProps = { cluster: Cluster };

const buildEmptyValidationsMap = (): WizardStepValidationMap => ({
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
});

const staticIpValidationsMap = buildEmptyValidationsMap();
const operatorsStepValidationsMap = buildEmptyValidationsMap();

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
      'lso-requirements-satisfied',
      'odf-requirements-satisfied',
      'lvm-requirements-satisfied',
      'cnv-requirements-satisfied',
      'nvidia-gpu-requirements-satisfied',
      'openshift-ai-requirements-satisfied',
      'osc-requirements-satisfied',
      'amd-gpu-requirements-satisfied',
    ],
  },
  host: {
    allowedStatuses: ['known', 'disabled'],
    groups: ['hardware'],
    validationIds: [
      'connected',
      'hostname-valid',
      'media-connected',
      'lso-requirements-satisfied',
      'odf-requirements-satisfied',
      'lvm-requirements-satisfied',
      'cnv-requirements-satisfied',
      'nvidia-gpu-requirements-satisfied',
      'openshift-ai-requirements-satisfied',
      'osc-requirements-satisfied',
      'amd-gpu-requirements-satisfied',
    ],
  },
  softValidationIds: [
    'no-skip-installation-disk',
    'no-skip-missing-disk',
    'compatible-agent',
    'openshift-ai-gpu-requirements-satisfied',
    'inventory-not-partially-truncated',
  ],
};

const storageStepValidationsMap: WizardStepValidationMap = {
  cluster: {
    groups: [],
    validationIds: ['sufficient-masters-count'],
  },
  host: {
    allowedStatuses: ['known', 'disabled'],
    groups: ['hardware'],
    validationIds: [
      'connected',
      'media-connected',
      'no-skip-installation-disk',
      'no-skip-missing-disk',
    ],
  },
  softValidationIds: ['inventory-not-partially-truncated'],
};

const networkingStepValidationsMap: WizardStepValidationMap = {
  cluster: {
    groups: ['network'],
    validationIds: [
      'api-vips-defined',
      'machine-cidr-defined',
      'cluster-cidr-defined',
      'service-cidr-defined',
      'all-hosts-are-ready-to-install',
    ],
  },
  host: {
    allowedStatuses: ['known', 'disabled'],
    groups: ['network'],
    validationIds: ['apps-domain-name-resolved-correctly'],
  },
  // TODO(jtomasek): container-images-available validation is currently not running on the backend, it stays in pending.
  // marking it as soft validation is the easy way to prevent it from blocking the progress.
  // Alternatively we would have to whitelist network validations instead of using group
  // TODO(mlibra): remove that container-images-available from soft validations and let backend drive it via disabling it.
  //   Depends on: https://issues.redhat.com/browse/MGMT-5265
  softValidationIds: [
    'ntp-synced',
    'container-images-available',
    'mtu-valid',
    'custom-manifests-requirements-satisfied',
  ],
};

const customManifestsValidationsMap: WizardStepValidationMap = {
  cluster: {
    groups: ['network'],
    validationIds: ['platform-requirements-satisfied', 'custom-manifests-requirements-satisfied'],
  },
  host: {
    allowedStatuses: ['known', 'disabled'],
    groups: ['network'],
    validationIds: [],
  },
  softValidationIds: ['ntp-synced', 'container-images-available', 'mtu-valid'],
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

const credentialsValidationMap = buildEmptyValidationsMap();

const disconnectedReviewValidationsMap = buildEmptyValidationsMap();
const disconnectedBasicValidationsMap = buildEmptyValidationsMap();

export const wizardStepsValidationsMap: WizardStepsValidationMap<ClusterWizardStepsType> = {
  'cluster-details': clusterDetailsStepValidationsMap,
  'static-ip-yaml-view': staticIpValidationsMap,
  'static-ip-network-wide-configurations': staticIpValidationsMap,
  'static-ip-host-configurations': staticIpValidationsMap,
  operators: operatorsStepValidationsMap,
  'host-discovery': hostDiscoveryStepValidationsMap,
  storage: storageStepValidationsMap,
  networking: networkingStepValidationsMap,
  'custom-manifests': customManifestsValidationsMap,
  'credentials-download': credentialsValidationMap,
  review: reviewStepValidationsMap,
  'disconnected-review': disconnectedReviewValidationsMap,
  'disconnected-basic': disconnectedBasicValidationsMap,
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

export const canNextOperators = ({ cluster }: TransitionProps): boolean =>
  getWizardStepClusterStatus('operators', wizardStepsValidationsMap, cluster, cluster.hosts) ===
  'ready';

export const canNextNetwork = ({ cluster }: TransitionProps): boolean =>
  getWizardStepClusterStatus('networking', wizardStepsValidationsMap, cluster, cluster.hosts) ===
  'ready';

export const isNetworkingStepAwaitingValidations = ({ cluster }: TransitionProps): boolean =>
  isWizardStepAwaitingValidations('networking', wizardStepsValidationsMap, cluster);

export const isStaticIpStep = (stepId: ClusterWizardStepsType | Day2WizardStepsType) => {
  return stepId.startsWith('static-ip');
};
