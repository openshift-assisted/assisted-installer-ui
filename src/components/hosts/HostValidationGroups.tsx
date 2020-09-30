import React, { Fragment } from 'react';
import { Alert, AlertGroup, AlertVariant, Level, LevelItem } from '@patternfly/react-core';
import {
  global_warning_color_100 as warningColor,
  global_success_color_100 as okColor,
} from '@patternfly/react-tokens';
import { PendingIcon, CheckCircleIcon, WarningTriangleIcon } from '@patternfly/react-icons';
import { ValidationsInfo, Validation } from '../../types/hosts';
import { HOST_VALIDATION_GROUP_LABELS, HOST_VALIDATION_LABELS } from '../../config/constants';
import './HostValidationGroups.css';

type HostValidationGroupsProps = {
  validationsInfo: ValidationsInfo;
};

const HostValidationGroups: React.FC<HostValidationGroupsProps> = ({ validationsInfo }) => {
  return (
    <>
      {Object.keys(validationsInfo).map((groupName: string) => {
        const groupLabel = HOST_VALIDATION_GROUP_LABELS[groupName];

        const pendingValidations = validationsInfo[groupName].filter(
          (v: Validation) => v.status === 'pending',
        );
        const failedValidations = validationsInfo[groupName].filter(
          (v: Validation) => v.status === 'failure',
        );

        const getValidationGroupState = () => {
          if (pendingValidations.length) {
            return (
              <>
                Pending input <PendingIcon />
              </>
            );
          } else if (failedValidations.length) {
            return (
              <>
                Failed <WarningTriangleIcon color={warningColor.value} />
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
                />
              )}
              <ValidationGroupAlert
                variant={AlertVariant.warning}
                title="Failed validations:"
                validations={failedValidations}
              />
            </AlertGroup>
          </Fragment>
        );
      })}
    </>
  );
};

export default HostValidationGroups;

type ValidationGroupAlertProps = {
  variant: AlertVariant;
  validations: Validation[];
  title: string;
};

const ValidationGroupAlert: React.FC<ValidationGroupAlertProps> = ({
  variant,
  validations,
  title,
}) => {
  if (!validations.length) {
    return null;
  }
  return (
    <Alert title={title} variant={variant} isInline>
      <ul>
        {validations.map((v) => (
          <li key={v.id}>
            <strong>{HOST_VALIDATION_LABELS[v.id]}:</strong> {v.message}
          </li>
        ))}
      </ul>
    </Alert>
  );
};
