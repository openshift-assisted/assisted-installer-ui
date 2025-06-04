import React from 'react';
import lodashValues from 'lodash-es/values.js';
import { Button, ButtonVariant } from '@patternfly/react-core';
import { CheckCircleIcon } from '@patternfly/react-icons/dist/js/icons/check-circle-icon';
import { ExclamationCircleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-circle-icon';
import { ExclamationTriangleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-triangle-icon';
import { t_global_color_status_success_default as okColor } from '@patternfly/react-tokens/dist/js/t_global_color_status_success_default';

import {
  ValidationsInfo as ClusterValidationsInfo,
  Validation as ClusterValidation,
} from '../../types/clusters';
import {
  ValidationsInfo as HostValidationsInfo,
  Validation as HostValidation,
} from '../../types/hosts';
import type {
  ClusterValidationId,
  HostValidationId,
} from '@openshift-assisted/types/assisted-installer-service';
import { clusterValidationLabels, hostValidationLabels } from '../../config';
import { getEnabledHosts } from '../hosts';
import { findValidationFixStep } from './validationsInfoUtils';
import {
  ClusterValidationsProps,
  FailingValidationsProps,
  HostsValidationsProps,
  ValidationActionLinkProps,
} from './types';
import { useTranslation } from '../../hooks/use-translation-wrapper';
import { Trans } from 'react-i18next';
import { getKeys, stringToJSON } from '../../utils';
import { UiIcon } from '../ui';

const AllValidationsPassed = () => {
  const { t } = useTranslation();
  return (
    <>
      <CheckCircleIcon color={okColor.value} /> {t('ai:All checks passed')}
    </>
  );
};

const PendingValidations = ({ id, count }: { id: string; count: number }) => {
  const { t } = useTranslation();
  return <div id={id}>{t('ai:There is still {{count}} pending check', { count: count })}</div>;
};

const ValidationActionLink = <S extends string>({
  step,
  setCurrentStepId,
  wizardStepNames,
}: ValidationActionLinkProps<S>) => (
  <Button variant={ButtonVariant.link} onClick={() => setCurrentStepId(step)} isInline>
    {wizardStepNames[step]}
  </Button>
);

const FailingValidation = <S extends string>({
  validation,
  clusterGroup,
  hostGroup,
  severity = 'danger',
  setCurrentStepId,
  wizardStepNames,
  wizardStepsValidationsMap,
  host,
}: FailingValidationsProps<S>) => {
  const { t } = useTranslation();

  const issue = t('ai:{{check_failed}} check failed', {
    check_failed:
      hostValidationLabels(t)[validation.id as HostValidationId] ||
      clusterValidationLabels(t)[validation.id as ClusterValidationId] ||
      validation.id,
  });

  let fix;
  const step = findValidationFixStep<S>(
    { validationId: validation.id, clusterGroup, hostGroup },
    wizardStepsValidationsMap,
  );

  if (step === 'review') {
    // no sooner step, so the user can not do anything about it ...
    fix = t('ai:Please wait till all checks are finished.');
  } else if (step) {
    const pageURL = host
      ? wizardStepsValidationsMap[step].getPageURL?.(host, validation.id)
      : undefined;
    fix = pageURL ? (
      <>
        <Trans t={t}>
          ai:It can be fixed in the <a href={pageURL.url}>{pageURL.name}</a> page.
        </Trans>
      </>
    ) : (
      <>
        <Trans t={t}>
          ai:It can be fixed in the{' '}
          <ValidationActionLink
            step={step}
            setCurrentStepId={setCurrentStepId}
            wizardStepNames={wizardStepNames}
          />{' '}
          step.
        </Trans>
      </>
    );
  } else {
    if (validation.id === 'platform-requirements-satisfied') {
      fix = validation.message;
    }
    // console.error(
    //   'Unknown validation ID detected in the ',
    //   clusterGroup || hostGroup,
    //   ' group:',
    //   JSON.stringify(validation),
    // );
  }

  let icon;
  if (severity === 'warning') {
    icon = <UiIcon status="warning" icon={<ExclamationTriangleIcon />} />;
  } else {
    icon = <UiIcon status="danger" icon={<ExclamationCircleIcon />} />;
  }

  return (
    <div id={`failing-validation-${validation.id}`}>
      {icon} {issue}
      {fix ? '.' : ''} {fix}
    </div>
  );
};

export const ClusterValidations = <S extends string>({
  validationsInfo: validationsInfoString = '',
  setCurrentStepId,
  wizardStepNames,
  wizardStepsValidationsMap,
}: ClusterValidationsProps<S>) => {
  const validationsInfo = stringToJSON<ClusterValidationsInfo>(validationsInfoString) || {};
  const failingValidations: React.ReactNode[] = [];
  let pendingCount = 0;
  getKeys(validationsInfo).forEach((group) => {
    const addFailingValidation = (validation: ClusterValidation): void => {
      if (validation.status === 'pending') {
        pendingCount++;
      }

      if (validation.status === 'failure') {
        failingValidations.push(
          <FailingValidation
            key={validation.id}
            validation={validation}
            clusterGroup={group}
            setCurrentStepId={setCurrentStepId}
            wizardStepNames={wizardStepNames}
            wizardStepsValidationsMap={wizardStepsValidationsMap}
          />,
        );
      }
    };

    validationsInfo[group]?.forEach(addFailingValidation);
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

export const HostsValidations = <S extends string, V extends string[]>({
  hosts = [],
  setCurrentStepId,
  wizardStepNames,
  allClusterWizardSoftValidationIds,
  wizardStepsValidationsMap,
}: HostsValidationsProps<S, V>) => {
  const failingValidations: Partial<Record<HostValidationId, React.ReactNode>> = {};
  getEnabledHosts(hosts).forEach((host) => {
    const validationsInfo = stringToJSON<HostValidationsInfo>(host.validationsInfo) || {};
    getKeys(validationsInfo).forEach((group) => {
      const addFailingValidation = (validation: HostValidation): void => {
        if (validation.status === 'failure') {
          const validationId = validation.id;
          const severity = allClusterWizardSoftValidationIds.includes(validationId)
            ? 'warning'
            : 'danger';
          if (!failingValidations[validationId]) {
            failingValidations[validationId] = (
              <FailingValidation<S>
                key={validationId}
                validation={validation}
                host={host}
                hostGroup={group}
                severity={severity}
                setCurrentStepId={setCurrentStepId}
                wizardStepNames={wizardStepNames}
                wizardStepsValidationsMap={wizardStepsValidationsMap}
              />
            );
          }
        }
      };

      validationsInfo[group]?.forEach(addFailingValidation);
    });
  });

  const array = lodashValues(failingValidations);
  if (array.length === 0) {
    return <AllValidationsPassed />;
  }

  return <>{array}</>;
};
