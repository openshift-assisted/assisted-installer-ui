import _ from 'lodash';
import { Cluster, ClusterValidationId, Host, HostValidationId, stringToJSON } from '../../api';
import {
  ValidationGroup as ClusterValidationGroup,
  ValidationsInfo as ClusterValidationsInfo,
} from '../../types/clusters';
import {
  Validation,
  ValidationGroup as HostValidationGroup,
  ValidationsInfo as HostValidationsInfo,
  ValidationsInfo,
} from '../../types/hosts';

export type ClusterWizardStepsType =
  | 'cluster-details'
  | 'baremetal-discovery'
  | 'networking'
  | 'review';

export type ClusterWizardFlowStateType = {
  wizardFlow?: 'new' | undefined;
};

export const getClusterWizardFirstStep = (
  props?: ClusterWizardFlowStateType,
): ClusterWizardStepsType =>
  props?.wizardFlow === 'new' ? 'baremetal-discovery' : 'cluster-details';

type TransitionProps = { cluster: Cluster };

type WizardStepValidationMap = {
  cluster: {
    groups: ClusterValidationGroup[];
    validationIds: ClusterValidationId[];
  };
  host: {
    allowedStatuses: Host['status'][];
    groups: HostValidationGroup[];
    validationIds: HostValidationId[];
  };
  softValidationIds: (HostValidationId | ClusterValidationId)[];
};

type WizardStepsValidationMap = {
  [key in ClusterWizardStepsType]: WizardStepValidationMap;
};

const clusterDetailsStepValidationsMap: WizardStepValidationMap = {
  cluster: {
    groups: [],
    validationIds: ['pull-secret-set', 'dns-domain-defined'],
  },
  host: {
    allowedStatuses: ['known', 'disabled', 'discovering'],
    groups: [],
    validationIds: [],
  },
  softValidationIds: [],
};

const baremetalDiscoveryStepValidationsMap: WizardStepValidationMap = {
  cluster: {
    groups: [],
    validationIds: ['sufficient-masters-count', 'ocs-requirements-satisfied'],
  },
  host: {
    allowedStatuses: ['known', 'disabled'],
    groups: ['hardware'],
    validationIds: ['connected', 'container-images-available'],
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
  softValidationIds: ['ntp-synced'],
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

export const wizardStepsValidationsMap: WizardStepsValidationMap = {
  'cluster-details': clusterDetailsStepValidationsMap,
  'baremetal-discovery': baremetalDiscoveryStepValidationsMap,
  networking: networkingStepValidationsMap,
  review: reviewStepValidationsMap,
};

export const allClusterWizardSoftValidationIds: WizardStepValidationMap['softValidationIds'] = Object.keys(
  wizardStepsValidationsMap,
).reduce(
  (prev, curr) => [...prev, ...wizardStepsValidationsMap[curr].softValidationIds],
  [] as WizardStepValidationMap['softValidationIds'],
);

export const getFailingClusterWizardSoftValidationIds = (
  wizardHostStepValidationsInfo: ValidationsInfo,
  wizardStepId: ClusterWizardStepsType,
) => {
  const failingValidationIds = Object.keys(wizardHostStepValidationsInfo)
    .reduce((curr, group) => {
      const failingValidations = wizardHostStepValidationsInfo[group].filter(
        (validation: Validation) => validation.status === 'failure',
      );
      return [...curr, ...failingValidations];
    }, [] as Validation[])
    .map((validation) => validation.id);
  return failingValidationIds.filter((id) =>
    wizardStepsValidationsMap[wizardStepId].softValidationIds.includes(id),
  );
};

export const checkClusterValidations = (
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

export const checkClusterValidationGroups = (
  clusterValidationsInfo: ClusterValidationsInfo,
  groups: ClusterValidationGroup[],
) =>
  groups.every((group) =>
    clusterValidationsInfo[group]?.every((validation) => validation.status === 'success'),
  );

export const checkHostValidations = (
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

export const checkHostValidationGroups = (
  hostValidationsInfo: HostValidationsInfo,
  groups: HostValidationGroup[],
) =>
  groups.every((group) =>
    hostValidationsInfo[group]?.every((validation) => validation.status === 'success'),
  );

export const getWizardStepHostValidationsInfo = (
  validationsInfo: HostValidationsInfo,
  wizardStepId: ClusterWizardStepsType,
): HostValidationsInfo => {
  const { groups, validationIds } = wizardStepsValidationsMap[wizardStepId].host;
  return _.reduce(
    validationsInfo,
    (result, groupValidations, groupName) => {
      if (groups.includes(groupName as HostValidationGroup)) {
        result[groupName] = groupValidations;
        return result;
      }
      const selectedValidations = (groupValidations || []).filter((validation) =>
        validationIds.includes(validation.id),
      );
      if (selectedValidations.length) {
        result[groupName] = selectedValidations;
        return result;
      }
      return result;
    },
    {},
  );
};

export const getWizardStepHostStatus = (
  host: Host,
  wizardStepId: ClusterWizardStepsType,
): Host['status'] => {
  const { status } = host;
  if (['insufficient', 'pending-for-input'].includes(status)) {
    const validationsInfo = stringToJSON<HostValidationsInfo>(host.validationsInfo) || {};
    const { groups, validationIds } = wizardStepsValidationsMap[wizardStepId].host;
    return checkHostValidationGroups(validationsInfo, groups) &&
      checkHostValidations(validationsInfo, validationIds)
      ? 'known'
      : status;
  }
  return status;
};

export const getWizardStepClusterValidationsInfo = (
  validationsInfo: ClusterValidationsInfo,
  wizardStepId: ClusterWizardStepsType,
): ClusterValidationsInfo => {
  const { groups, validationIds } = wizardStepsValidationsMap[wizardStepId].cluster;
  return _.reduce(
    validationsInfo,
    (result, groupValidations, groupName) => {
      if (groups.includes(groupName as ClusterValidationGroup)) {
        result[groupName] = groupValidations;
        return result;
      }
      const selectedValidations = (groupValidations || []).filter((validation) =>
        validationIds.includes(validation.id),
      );
      if (selectedValidations.length) {
        result[groupName] = selectedValidations;
        return result;
      }
      return result;
    },
    {},
  );
};

export const getWizardStepClusterStatus = (
  cluster: Cluster,
  wizardStepId: ClusterWizardStepsType,
): Cluster['status'] => {
  const { status } = cluster;
  if (['insufficient', 'pending-for-input'].includes(status)) {
    const validationsInfo = stringToJSON<ClusterValidationsInfo>(cluster.validationsInfo) || {};
    const { groups, validationIds } = wizardStepsValidationsMap[wizardStepId].cluster;
    const { allowedStatuses } = wizardStepsValidationsMap[wizardStepId].host;
    const allHostsReady = (cluster?.hosts || []).every((host) =>
      allowedStatuses.includes(getWizardStepHostStatus(host, wizardStepId)),
    );
    return allHostsReady &&
      checkClusterValidationGroups(validationsInfo, groups) &&
      checkClusterValidations(validationsInfo, validationIds)
      ? 'ready'
      : status;
  }
  return status;
};

export const findValidationFixStep = ({
  id,
  hostGroup,
  clusterGroup,
}: {
  // validation IDs are unique
  id: ClusterValidationId | HostValidationId;
  hostGroup?: HostValidationGroup;
  clusterGroup?: ClusterValidationGroup;
}): ClusterWizardStepsType | undefined => {
  const keys = _.keys(wizardStepsValidationsMap) as ClusterWizardStepsType[];
  return keys.find((key) => {
    // find first matching validation-map name
    const { cluster: clusterValidationMap, host: hostValidationMap } = wizardStepsValidationsMap[
      key
    ];
    return (
      clusterValidationMap.validationIds.includes(id as ClusterValidationId) ||
      hostValidationMap.validationIds.includes(id as HostValidationId) ||
      (clusterGroup && clusterValidationMap.groups.includes(clusterGroup)) ||
      (hostGroup && hostValidationMap.groups.includes(hostGroup))
    );
  });
};

/*
We are colocating all these canNext* functions for easier maintenance.
However transitions among steps should be independent on each other.
*/
export const canNextClusterDetails = ({ cluster }: TransitionProps): boolean =>
  getWizardStepClusterStatus(cluster, 'cluster-details') === 'ready';

export const canNextBaremetalDiscovery = ({ cluster }: TransitionProps): boolean =>
  getWizardStepClusterStatus(cluster, 'baremetal-discovery') === 'ready';

export const canNextNetwork = ({ cluster }: TransitionProps): boolean =>
  getWizardStepClusterStatus(cluster, 'networking') === 'ready';
