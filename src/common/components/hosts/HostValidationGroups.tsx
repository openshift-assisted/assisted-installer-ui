import React, { Fragment } from 'react';
import { Alert, AlertGroup, AlertVariant, Level, LevelItem } from '@patternfly/react-core';
import {
  global_warning_color_100 as warningColor,
  global_success_color_100 as okColor,
} from '@patternfly/react-tokens';
import { PendingIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@patternfly/react-icons';

import { Host } from '../../api';
import { Validation, ValidationsInfo } from '../../types/hosts';
import {
  HOST_VALIDATION_FAILURE_HINTS,
  HOST_VALIDATION_GROUP_LABELS,
  HOST_VALIDATION_LABELS,
} from '../../config';
import { toSentence } from '../ui/table/utils';
import Hostname from './Hostname';

import './HostValidationGroups.css';

export type AdditionNtpSourcePropsType = {
  AdditionalNTPSourcesDialogToggleComponent?: React.FC;
};

export type ValidationInfoActionProps = AdditionNtpSourcePropsType & {
  onEditHostname?: () => void;
  host: Host;
};

type HostValidationGroupsProps = ValidationInfoActionProps & {
  validationsInfo: ValidationsInfo;
};

type ValidationGroupAlertProps = ValidationInfoActionProps & {
  variant: AlertVariant;
  validations: Validation[];
  title: string;
};

const ValidationGroupAlert: React.FC<ValidationGroupAlertProps> = ({
  variant,
  validations,
  title,
  onEditHostname,
  AdditionalNTPSourcesDialogToggleComponent,
  ...props
}) => {
  let isValidHostname = true;
  if (!validations.length) {
    return null;
  }

  const actionLinks = [];
  if (
    validations.find(
      (validation) =>
        validation.status === 'failure' &&
        ['hostname-unique', 'hostname-valid'].includes(validation.id),
    )
  ) {
    actionLinks.push(
      <Hostname
        key="change-hostname"
        title="Change hostname"
        onEditHostname={onEditHostname}
        {...props}
      />,
    );
    isValidHostname = false;
  }
  if (
    AdditionalNTPSourcesDialogToggleComponent &&
    validations.find(
      (validation) => validation.status === 'failure' && validation.id === 'ntp-synced',
    )
  ) {
    actionLinks.push(<AdditionalNTPSourcesDialogToggleComponent key="add-ntp-sources" />);
  }

  return (
    <Alert title={title} variant={variant} actionLinks={actionLinks} isInline>
      <ul>
        {validations.map((v) => (
          <li key={v.id}>
            <strong>{HOST_VALIDATION_LABELS[v.id] || v.id}:</strong>&nbsp;{toSentence(v.message)}{' '}
            {v.status === 'failure' && HOST_VALIDATION_FAILURE_HINTS[v.id]}
          </li>
        ))}
      </ul>
      {!isValidHostname && (
        <span>To fix this click the "Change hostname" link and rename the host.</span>
      )}
    </Alert>
  );
};

export const HostValidationGroups: React.FC<HostValidationGroupsProps> = ({
  validationsInfo,
  ...props
}) => {
  return (
    <>
      {Object.keys(validationsInfo).map((groupName: string) => {
        const groupLabel = HOST_VALIDATION_GROUP_LABELS[groupName];

        const pendingValidations = validationsInfo[groupName].filter(
          (v: Validation) => v.status === 'pending',
        );
        const failedValidations = validationsInfo[groupName].filter(
          (v: Validation) => v.status === 'failure' || v.status === 'error',
        );

        const getValidationGroupState = () => {
          if (failedValidations.length) {
            return (
              <>
                Failed <ExclamationTriangleIcon color={warningColor.value} />
              </>
            );
          } else if (pendingValidations.length) {
            return (
              <>
                Pending input <PendingIcon />
              </>
            );
          }
          return (
            <>
              Ready <CheckCircleIcon color={okColor.value} />
            </>
          );
        };

        return (
          <Fragment key={groupName}>
            <Level className="host-validation-groups__validation-group">
              <LevelItem>
                <strong>{groupLabel}</strong>
              </LevelItem>
              <LevelItem>{getValidationGroupState()}</LevelItem>
            </Level>
            <AlertGroup>
              {!failedValidations.length && ( // display pending validations only if there are no failing validations
                <ValidationGroupAlert
                  variant={AlertVariant.info}
                  title="Pending validations:"
                  validations={pendingValidations}
                  {...props}
                />
              )}
              <ValidationGroupAlert
                variant={AlertVariant.warning}
                title="Failed validations:"
                validations={failedValidations}
                {...props}
              />
            </AlertGroup>
          </Fragment>
        );
      })}
    </>
  );
};
