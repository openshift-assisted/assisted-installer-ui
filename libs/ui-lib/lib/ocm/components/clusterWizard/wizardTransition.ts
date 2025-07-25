import {
  findValidationStep,
  getAllClusterWizardSoftValidationIds,
  getWizardStepClusterStatus,
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
import {
  Cluster,
  Host,
  HostValidationId,
} from '@openshift-assisted/types/assisted-installer-service';

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
  | 'credentials-download';

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

export const ClusterWizardFlowStateNew = 'new';
export type ClusterWizardFlowStateType = Cluster['status'] | typeof ClusterWizardFlowStateNew;

export const getLastStepForWizard = (
  customManifestsStepNeedsToBeFilled: boolean,
): ClusterWizardStepsType => {
  if (customManifestsStepNeedsToBeFilled) {
    return 'custom-manifests';
  } else {
    return 'review';
  }
};

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
  hosts?: Host[] | undefined,
  customManifestsStepNeedsToBeFilled?: boolean,
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
      return getLastStepForWizard(customManifestsStepNeedsToBeFilled || false);
    case 'pending-for-input':
    case 'adding-hosts':
    case 'insufficient':
      return getStepForFailingHostValidations(hosts);
    default:
      return 'cluster-details';
  }
};

const getStepForFailingHostValidations = (hosts: Host[] | undefined) => {
  const failingValidations: HostValidationId[] = getHostFailingValidationIds(hosts);
  const minimumStep = 'host-discovery';
  let step;
  for (const failingValidationId of failingValidations) {
    step = findValidationStep<string>(failingValidationId, wizardStepsValidationsMap, minimumStep);
    if (step !== undefined) {
      break;
    }
  }
  return (step || minimumStep) as ClusterWizardStepsType;
};

const getHostFailingValidationIds = (hosts: Host[] | undefined) => {
  const failingValidations: HostValidationId[] = [];
  hosts?.forEach((host) => {
    const validationsInfo = stringToJSON<HostValidationsInfo>(host.validationsInfo) || {};
    getKeys(validationsInfo).forEach((group) => {
      const f: (validation: HostValidation) => void = (validation) => {
        if (validation.status === 'failure') {
          failingValidations.push(validation.id);
        }
      };
      const validationGroup = validationsInfo[group] as HostValidation[];
      validationGroup.forEach(f);
    });
  });
  return failingValidations;
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

const customManifestsValidationsMap = buildEmptyValidationsMap();

export const wizardStepsValidationsMap: WizardStepsValidationMap<ClusterWizardStepsType> = {
  'cluster-details': clusterDetailsStepValidationsMap,
  'static-ip-yaml-view': staticIpValidationsMap,
  'static-ip-network-wide-configurations': staticIpValidationsMap,
  'static-ip-host-configurations': staticIpValidationsMap,
  'custom-manifests': customManifestsValidationsMap,
  operators: operatorsStepValidationsMap,
  'host-discovery': hostDiscoveryStepValidationsMap,
  storage: storageStepValidationsMap,
  networking: networkingStepValidationsMap,
  review: reviewStepValidationsMap,
  'credentials-download': credentialsValidationMap,
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

export const isStaticIpStep = (stepId: ClusterWizardStepsType | Day2WizardStepsType) => {
  return stepId.startsWith('static-ip');
};
