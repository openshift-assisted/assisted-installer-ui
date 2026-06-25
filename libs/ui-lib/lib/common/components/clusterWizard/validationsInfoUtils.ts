import lodashValues from 'lodash-es/values.js';
import lodashKeys from 'lodash-es/keys.js';
import reduce from 'lodash-es/reduce.js';

import type {
  Cluster,
  ClusterValidationId,
  Host,
  HostValidationId,
} from '@openshift-assisted/types/assisted-installer-service';
import {
  ClusterWizardStepStatusDeterminationObject,
  ValidationGroup as ClusterValidationGroup,
  ValidationsInfo as ClusterValidationsInfo,
} from '../../../common/types/clusters';
import {
  ClusterWizardStepHostStatusDeterminationObject,
  Validation,
  ValidationGroup,
  ValidationGroup as HostValidationGroup,
  ValidationsInfo,
  ValidationsInfo as HostValidationsInfo,
} from '../../../common/types/hosts';
import { stringToJSON } from '../../utils';
import { getEnabledHosts } from '../hosts/utils';

const HOST_STATUSES_REQUIRING_ACTION: Host['status'][] = ['disconnected'];
const HOST_STATUSES_TRANSIENT: Host['status'][] = ['discovering', 'binding'];

const isHardFailure = (
  validation: Validation,
  softValidationIds: WizardStepValidationMap['softValidationIds'],
) =>
  (validation.status === 'failure' || validation.status === 'error') &&
  !softValidationIds.includes(validation.id);

const hasHardFailures = (
  validations: Validation[],
  softValidationIds: WizardStepValidationMap['softValidationIds'],
) => validations.some((validation) => isHardFailure(validation, softValidationIds));

const hasPending = (validations: Validation[]) =>
  validations.some((validation) => validation.status === 'pending');

const getStepScopedValidations = <ClusterWizardStepsType extends string>(
  cluster: ClusterWizardStepStatusDeterminationObject & {
    hosts?: ClusterWizardStepHostStatusDeterminationObject[];
  },
  enabledHosts: ClusterWizardStepHostStatusDeterminationObject[],
  wizardStepId: ClusterWizardStepsType,
  wizardStepsValidationsMap: WizardStepsValidationMap<ClusterWizardStepsType>,
): Validation[] => {
  const clusterValidationsInfo =
    (typeof cluster.validationsInfo === 'string'
      ? stringToJSON<ClusterValidationsInfo>(cluster.validationsInfo)
      : cluster.validationsInfo) || {};
  const clusterStepValidations = lodashValues(
    getWizardStepClusterValidationsInfo(
      clusterValidationsInfo,
      wizardStepId,
      wizardStepsValidationsMap,
    ),
  ).flat() as Validation[];

  const hostStepValidations = enabledHosts.flatMap((host) => {
    const hostValidationsInfo =
      (typeof host.validationsInfo === 'string'
        ? stringToJSON<HostValidationsInfo>(host.validationsInfo)
        : host.validationsInfo) || {};
    return lodashValues(
      getWizardStepHostValidationsInfo(
        hostValidationsInfo,
        wizardStepId,
        wizardStepsValidationsMap,
      ),
    ).flat();
  });

  return [...clusterStepValidations, ...hostStepValidations];
};

export type WizardStepValidationMap = {
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
  getPageURL?: (
    host: Host,
    validationId: string,
  ) =>
    | {
        url: string;
        name: string;
      }
    | undefined;
};

export type WizardStepsValidationMap<T extends string> = {
  [key in T]: WizardStepValidationMap;
};

export const findValidationFixStep = <ClusterWizardStepsType extends string>(
  {
    validationId,
    hostGroup,
    clusterGroup,
  }: {
    // validation IDs are unique
    validationId: ClusterValidationId | HostValidationId;
    hostGroup?: HostValidationGroup;
    clusterGroup?: ClusterValidationGroup;
  },
  wizardStepsValidationsMap: WizardStepsValidationMap<ClusterWizardStepsType>,
): ClusterWizardStepsType | undefined => {
  const keys = lodashKeys(wizardStepsValidationsMap) as ClusterWizardStepsType[];
  return keys.find((key) => {
    // find first matching validation-map name
    const { cluster: clusterValidationMap, host: hostValidationMap } =
      wizardStepsValidationsMap[key];
    return (
      clusterValidationMap.validationIds.includes(validationId as ClusterValidationId) ||
      hostValidationMap.validationIds.includes(validationId as HostValidationId) ||
      (clusterGroup && clusterValidationMap.groups.includes(clusterGroup)) ||
      (hostGroup && hostValidationMap.groups.includes(hostGroup))
    );
  });
};

export const checkClusterValidations = (
  clusterValidationsInfo: ClusterValidationsInfo,
  requiredIds: ClusterValidationId[],
): boolean => {
  const requiredValidations = lodashValues(clusterValidationsInfo)
    .flat()
    .filter((v) => v && requiredIds.includes(v.id));
  return (
    requiredValidations.length === requiredIds.length &&
    requiredValidations.every((v) => v?.status === 'disabled' || v?.status === 'success')
  );
};

export const checkClusterValidationGroups = (
  clusterValidationsInfo: ClusterValidationsInfo,
  groups: ClusterValidationGroup[],
  softValidationIds: WizardStepValidationMap['softValidationIds'],
) =>
  groups.every((group) =>
    clusterValidationsInfo[group]?.every(
      (validation) =>
        validation.status === 'disabled' ||
        validation.status === 'success' ||
        softValidationIds.includes(validation.id),
    ),
  );

export const checkHostValidations = (
  hostValidationsInfo: HostValidationsInfo,
  requiredIds: HostValidationId[],
): boolean => {
  const requiredValidations = lodashValues(hostValidationsInfo)
    .flat()
    .filter((v) => v && requiredIds.includes(v.id));

  return (
    requiredValidations.length === requiredIds.length &&
    requiredValidations.every((v) => v?.status === 'disabled' || v?.status === 'success')
  );
};

export const checkHostValidationGroups = (
  hostValidationsInfo: HostValidationsInfo,
  groups: HostValidationGroup[],
  softValidationIds: WizardStepValidationMap['softValidationIds'],
) =>
  groups.every((group) =>
    hostValidationsInfo[group]?.every(
      (validation) =>
        validation.status === 'disabled' ||
        validation.status === 'success' ||
        softValidationIds.includes(validation.id),
    ),
  );

export const getWizardStepHostValidationsInfo = <ClusterWizardStepsType extends string>(
  validationsInfo: HostValidationsInfo,
  wizardStepId: ClusterWizardStepsType,
  wizardStepsValidationsMap: WizardStepsValidationMap<ClusterWizardStepsType>,
): HostValidationsInfo => {
  const { groups, validationIds } = wizardStepsValidationsMap[wizardStepId].host;
  return reduce(
    validationsInfo,
    (result, groupValidations, groupNameStr) => {
      const groupName = groupNameStr as HostValidationGroup;
      if (groups.includes(groupName)) {
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
    {} as ValidationsInfo,
  );
};

export const getWizardStepHostStatus = <ClusterWizardStepsType extends string>(
  wizardStepId: ClusterWizardStepsType,
  wizardStepsValidationsMap: WizardStepsValidationMap<ClusterWizardStepsType>,
  host: ClusterWizardStepHostStatusDeterminationObject,
): Host['status'] => {
  const { status } = host;
  if (['insufficient', 'pending-for-input'].includes(status)) {
    const { softValidationIds } = wizardStepsValidationsMap[wizardStepId];
    // NOTE(jtomasek): REST API validationsInfo is string, K8s validationsInfo is ClusterValidationsInfo object
    const validationsInfo =
      (typeof host.validationsInfo === 'string'
        ? stringToJSON<HostValidationsInfo>(host.validationsInfo)
        : host.validationsInfo) || {};
    const { groups, validationIds } = wizardStepsValidationsMap[wizardStepId].host;
    return checkHostValidationGroups(validationsInfo, groups, softValidationIds) &&
      checkHostValidations(validationsInfo, validationIds)
      ? 'known'
      : status;
  }
  return status;
};

export const getWizardStepClusterValidationsInfo = <ClusterWizardStepsType extends string>(
  validationsInfo: ClusterValidationsInfo,
  wizardStepId: ClusterWizardStepsType,
  wizardStepsValidationsMap: WizardStepsValidationMap<ClusterWizardStepsType>,
): ClusterValidationsInfo => {
  const { groups, validationIds } = wizardStepsValidationsMap[wizardStepId].cluster;
  return reduce(
    validationsInfo,
    (result, groupValidations, groupNameStr) => {
      const groupName = groupNameStr as ClusterValidationGroup;
      if (groups.includes(groupName)) {
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
    {} as ClusterValidationsInfo,
  );
};

export const getWizardStepClusterStatus = <ClusterWizardStepsType extends string>(
  wizardStepId: ClusterWizardStepsType,
  wizardStepsValidationsMap: WizardStepsValidationMap<ClusterWizardStepsType>,
  cluster: ClusterWizardStepStatusDeterminationObject,
  clusterHosts: ClusterWizardStepHostStatusDeterminationObject[] = [],
): Cluster['status'] => {
  const { status } = cluster;
  if (['insufficient', 'pending-for-input'].includes(status)) {
    // NOTE(jtomasek): REST API validationsInfo is string, K8s validationsInfo is ClusterValidationsInfo object
    const validationsInfo =
      (typeof cluster.validationsInfo === 'string'
        ? stringToJSON<ClusterValidationsInfo>(cluster.validationsInfo)
        : cluster.validationsInfo) || {};
    const { groups, validationIds } = wizardStepsValidationsMap[wizardStepId].cluster;
    const { softValidationIds } = wizardStepsValidationsMap[wizardStepId];
    const { allowedStatuses } = wizardStepsValidationsMap[wizardStepId].host;
    const allHostsReady = clusterHosts.every(
      (host) =>
        allowedStatuses.length === 0 ||
        allowedStatuses.includes(
          getWizardStepHostStatus(wizardStepId, wizardStepsValidationsMap, host),
        ),
    );
    return allHostsReady &&
      checkClusterValidationGroups(validationsInfo, groups, softValidationIds) &&
      checkClusterValidations(validationsInfo, validationIds)
      ? 'ready'
      : status;
  }
  return status;
};

export const getAllClusterWizardSoftValidationIds = <ClusterWizardStepsType extends string>(
  wizardStepsValidationsMap: WizardStepsValidationMap<ClusterWizardStepsType>,
): WizardStepValidationMap['softValidationIds'] =>
  Object.keys(wizardStepsValidationsMap).reduce((prev, curr) => {
    const failingStepValidations = wizardStepsValidationsMap[curr as ClusterWizardStepsType];
    return [...prev, ...failingStepValidations.softValidationIds];
  }, [] as WizardStepValidationMap['softValidationIds']);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getFailingClusterWizardStepHostValidations = <ClusterWizardStepsType extends string>(
  wizardHostStepValidationsInfo: HostValidationsInfo,
) =>
  Object.keys(wizardHostStepValidationsInfo).reduce((curr, groupStr) => {
    const groupValidations = wizardHostStepValidationsInfo[groupStr as ValidationGroup];
    if (!groupValidations) {
      return curr;
    }
    const failingValidations =
      groupValidations.filter((validation: Validation) => validation.status === 'failure') || [];
    return [...curr, ...failingValidations];
  }, [] as Validation[]);

export const areOnlySoftValidationsOfWizardStepFailing = <ClusterWizardStepsType extends string>(
  validationsInfo: HostValidationsInfo,
  wizardStepId: ClusterWizardStepsType,
  wizardStepsValidationsMap: WizardStepsValidationMap<ClusterWizardStepsType>,
) => {
  const stepValidationsInfo = getWizardStepHostValidationsInfo(
    validationsInfo,
    wizardStepId,
    wizardStepsValidationsMap,
  );
  const failingValidationIds = getFailingClusterWizardStepHostValidations(stepValidationsInfo).map(
    (validation) => validation.id,
  );
  if (!failingValidationIds.length) return false;
  for (const id of failingValidationIds) {
    if (!wizardStepsValidationsMap[wizardStepId].softValidationIds.includes(id)) {
      return false;
    }
  }
  return true;
};

export const isWizardStepAwaitingValidations = <ClusterWizardStepsType extends string>(
  wizardStepId: ClusterWizardStepsType,
  wizardStepsValidationsMap: WizardStepsValidationMap<ClusterWizardStepsType>,
  cluster: ClusterWizardStepStatusDeterminationObject & {
    hosts?: ClusterWizardStepHostStatusDeterminationObject[];
  },
): boolean => {
  const { softValidationIds } = wizardStepsValidationsMap[wizardStepId];
  const enabledHosts = getEnabledHosts(cluster.hosts as Host[]);

  for (const host of enabledHosts) {
    const stepStatus = getWizardStepHostStatus(wizardStepId, wizardStepsValidationsMap, host);
    if (stepStatus === 'insufficient') {
      return false;
    }
    if (HOST_STATUSES_REQUIRING_ACTION.includes(host.status)) {
      return false;
    }
  }

  const stepValidations = getStepScopedValidations(
    cluster,
    enabledHosts,
    wizardStepId,
    wizardStepsValidationsMap,
  );

  if (hasHardFailures(stepValidations, softValidationIds)) {
    return false;
  }

  if (hasPending(stepValidations)) {
    return true;
  }

  if (enabledHosts.some((host) => HOST_STATUSES_TRANSIENT.includes(host.status))) {
    return true;
  }

  return false;
};

export const findValidationStep = <ClusterWizardStepsType extends string>(
  validationId: ClusterValidationId | HostValidationId,
  wizardStepsValidationsMap: WizardStepsValidationMap<ClusterWizardStepsType>,
  minimumStep: ClusterWizardStepsType,
): ClusterWizardStepsType | undefined => {
  const wizardStepsIds = lodashKeys(wizardStepsValidationsMap) as ClusterWizardStepsType[];
  let isBeforeMinimumStep = true;
  return wizardStepsIds.find((wizardStepId) => {
    if (wizardStepId === minimumStep) {
      isBeforeMinimumStep = false;
    }
    if (isBeforeMinimumStep) {
      return false;
    }
    // find first matching validation-map name, ignoring steps before minimumStep
    const { host: hostValidationMap } = wizardStepsValidationsMap[wizardStepId];
    return hostValidationMap.validationIds.includes(validationId as HostValidationId);
  });
};
