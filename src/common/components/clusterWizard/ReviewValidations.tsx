import React from 'react';
import _ from 'lodash';
import { Button, ButtonVariant } from '@patternfly/react-core';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
} from '@patternfly/react-icons';
import {
  global_success_color_100 as okColor,
  global_danger_color_100 as dangerColor,
  global_warning_color_100 as warningColor,
} from '@patternfly/react-tokens';
import {
  ValidationsInfo as ClusterValidationsInfo,
  ValidationGroup as ClusterValidationGroup,
  Validation as ClusterValidation,
} from '../../types/clusters';
import {
  ValidationsInfo as HostValidationsInfo,
  ValidationGroup as HostValidationGroup,
  Validation as HostValidation,
} from '../../types/hosts';
import { stringToJSON } from '../../api';
import { CLUSTER_VALIDATION_LABELS, HOST_VALIDATION_LABELS } from '../../config';
import { getEnabledHosts } from '../hosts';
import { findValidationFixStep } from './validationsInfoUtils';
import {
  HostsValidationsFC,
  ClusterValidationsFC,
  FailingValidationsFC,
  ValidationActionLinkFC,
} from './types';

const AllValidationsPassed = () => (
  <>
    <CheckCircleIcon color={okColor.value} /> All validations passed
  </>
);

const PendingValidations: React.FC<{ id: string; count: number }> = ({ id, count }) => (
  <div id={id}>
    There {count === 1 ? 'is' : 'are'} still {count} pending validation
    {count === 1 ? '' : 's'}.
  </div>
);

const ValidationActionLink: ValidationActionLinkFC = ({
  step,
  setCurrentStepId,
  wizardStepNames,
}) => (
  <Button variant={ButtonVariant.link} onClick={() => setCurrentStepId(step)} isInline>
    {wizardStepNames[step]}
  </Button>
);

const FailingValidation: FailingValidationsFC = ({
  validation,
  clusterGroup,
  hostGroup,
  severity = 'danger',
  setCurrentStepId,
  wizardStepNames,
  wizardStepsValidationsMap,
}) => {
  const issue = `${
    HOST_VALIDATION_LABELS[validation.id] ||
    CLUSTER_VALIDATION_LABELS[validation.id] ||
    validation.id
  } check failed. `;

  let fix;
  // eslint-disable-next-line
  const step = findValidationFixStep<any>(
    { validationId: validation.id, clusterGroup, hostGroup },
    wizardStepsValidationsMap,
  );
  if (step === 'review') {
    // no sooner step, so the user can not do anything about it ...
    fix = 'Please wait till all validations are finished.';
  } else if (step) {
    fix = (
      <>
        It can be fixed in the{' '}
        <ValidationActionLink
          step={step}
          setCurrentStepId={setCurrentStepId}
          wizardStepNames={wizardStepNames}
        />{' '}
        step.
      </>
    );
  } else {
    console.error(
      'Unknown validation ID detected in the ',
      clusterGroup || hostGroup,
      ' group:',
      JSON.stringify(validation),
    );
  }

  let icon;
  if (severity === 'warning') {
    icon = <ExclamationTriangleIcon color={warningColor.value} />;
  } else {
    icon = <ExclamationCircleIcon color={dangerColor.value} size="sm" />;
  }

  return (
    <div id={`failing-validation-${validation.id}`}>
      {icon} {issue}
      {fix}
    </div>
  );
};

export const ClusterValidations: ClusterValidationsFC = ({
  validationsInfo: validationsInfoString = '',
  setCurrentStepId,
  wizardStepNames,
  wizardStepsValidationsMap,
}) => {
  const validationsInfo = stringToJSON<ClusterValidationsInfo>(validationsInfoString) || {};
  const failingValidations: React.ReactNode[] = [];
  let pendingCount = 0;
  Object.keys(validationsInfo).forEach((group) => {
    const f: (validation: ClusterValidation) => void = (validation) => {
      if (validation.status === 'pending') {
        pendingCount++;
      }

      if (validation.status === 'failure') {
        failingValidations.push(
          <FailingValidation
            key={validation.id}
            validation={validation}
            clusterGroup={group as ClusterValidationGroup}
            setCurrentStepId={setCurrentStepId}
            wizardStepNames={wizardStepNames}
            wizardStepsValidationsMap={wizardStepsValidationsMap}
          />,
        );
      }
    };

    validationsInfo[group].forEach(f);
  });

  if (pendingCount) {
    failingValidations.unshift(
      <PendingValidations
        key="pending-validations"
        id="cluster-pending-validations"
        count={pendingCount}
      />,
    );
  }

  if (failingValidations.length === 0) {
    return <AllValidationsPassed />;
  }

  return <>{failingValidations}</>;
};

export const HostsValidations: HostsValidationsFC = ({
  hosts = [],
  setCurrentStepId,
  wizardStepNames,
  allClusterWizardSoftValidationIds,
  wizardStepsValidationsMap,
}) => {
  const failingValidations = {};
  getEnabledHosts(hosts).forEach((host) => {
    const validationsInfo = stringToJSON<HostValidationsInfo>(host.validationsInfo) || {};
    Object.keys(validationsInfo).forEach((group) => {
      const f: (validation: HostValidation) => void = (validation) => {
        if (validation.status === 'failure') {
          const severity = allClusterWizardSoftValidationIds.includes(validation.id)
            ? 'warning'
            : 'danger';
          failingValidations[validation.id] = failingValidations[validation.id] || (
            <FailingValidation
              key={validation.id}
              validation={validation}
              hostGroup={group as HostValidationGroup}
              severity={severity}
              setCurrentStepId={setCurrentStepId}
              wizardStepNames={wizardStepNames}
              wizardStepsValidationsMap={wizardStepsValidationsMap}
            />
          );
        }
      };

      validationsInfo[group].forEach(f);
    });
  });

  const array = _.values(failingValidations);
  if (array.length === 0) {
    return <AllValidationsPassed />;
  }

  return <>{array}</>;
};
