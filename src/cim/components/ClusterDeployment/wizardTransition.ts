import {
  getAllClusterWizardSoftValidationIds,
  WizardStepsValidationMap,
  WizardStepValidationMap,
} from '../../../common';

export type ClusterWizardStepsType =
  | 'cluster-details'
  | 'hosts-selection'
  | 'hosts-discovery'
  | 'networking';

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
      'ocs-requirements-satisfied',
      'lso-requirements-satisfied',
      'cnv-requirements-satisfied',
    ],
  },
  host: {
    allowedStatuses: ['known', 'disabled'],
    groups: ['hardware'],
    validationIds: [
      'connected',
      'ocs-requirements-satisfied',
      'lso-requirements-satisfied',
      'cnv-requirements-satisfied',
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
  softValidationIds: ['ntp-synced', 'container-images-available'],
};

// const reviewStepValidationsMap: WizardStepValidationMap = {
//   cluster: {
//     groups: [],
//     validationIds: ['all-hosts-are-ready-to-install'],
//   },
//   host: {
//     allowedStatuses: ['known', 'disabled'],
//     groups: [],
//     validationIds: [],
//   },
//   softValidationIds: [],
// };

export const wizardStepsValidationsMap: WizardStepsValidationMap<ClusterWizardStepsType> = {
  'cluster-details': clusterDetailsStepValidationsMap,
  'hosts-discovery': hostDiscoveryStepValidationsMap,
  'hosts-selection': hostDiscoveryStepValidationsMap,
  networking: networkingStepValidationsMap,
  // review: reviewStepValidationsMap,
};

export const allClusterWizardSoftValidationIds = getAllClusterWizardSoftValidationIds(
  wizardStepsValidationsMap,
);
