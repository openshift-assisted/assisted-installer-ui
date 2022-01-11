import React, { Fragment, ReactElement } from 'react';
import { Alert, AlertGroup, AlertVariant, Level, LevelItem } from '@patternfly/react-core';
import {
  global_warning_color_100 as warningColor,
  global_success_color_100 as okColor,
} from '@patternfly/react-tokens';
import { PendingIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@patternfly/react-icons';

import { Host, HostValidationId } from '../../api';
import { Validation, ValidationsInfo } from '../../types/hosts';
import {
  HOST_VALIDATION_FAILURE_HINTS,
  HOST_VALIDATION_GROUP_LABELS,
  HOST_VALIDATION_LABELS,
} from '../../config';
import { toSentence } from '../ui/table/utils';

import './HostValidationGroups.css';
import Hostname from './Hostname';

export type AdditionNtpSourcePropsType = {
  AdditionalNTPSourcesDialogToggleComponent?: React.FC;
};

export type UpdateDay2ApiVipPropsType = {
  UpdateDay2ApiVipDialogToggleComponent?: React.FC;
};

export type InvalidHostnameActionProps = {
  onEditHostname?: () => void;
  host: Host;
};

export type ValidationInfoActionProps = AdditionNtpSourcePropsType &
  InvalidHostnameActionProps &
  UpdateDay2ApiVipPropsType;

type HostValidationGroupsProps = ValidationInfoActionProps & {
  validationsInfo: ValidationsInfo;
};

type ValidationGroupAlertProps = ValidationInfoActionProps & {
  variant: AlertVariant;
  validations: Validation[];
  title: string;
};

const ValidationsAlert: React.FC<{
  validations: Validation[];
  variant: AlertVariant;
  title: string;
  actionLinks?: ReactElement[];
}> = ({ validations, variant, title, actionLinks = [] }) => (
  <Alert title={title} variant={variant} actionLinks={actionLinks} isInline>
    <ul>
      {validations.map((v) => (
        <li key={v.id}>
          <strong>{HOST_VALIDATION_LABELS[v.id] || v.id}:</strong>&nbsp;{toSentence(v.message)}{' '}
          {v.status === 'failure' && HOST_VALIDATION_FAILURE_HINTS[v.id]}
        </li>
      ))}
    </ul>
  </Alert>
);

const HostnameAlert: React.FC<
  Required<InvalidHostnameActionProps> & {
    hostnameValidations: Validation[];
    variant: AlertVariant;
  }
> = ({ onEditHostname, host, hostnameValidations, variant }) => {
  const actionLinks = [
    <Hostname
      key="change-hostname"
      title="Change hostname"
      onEditHostname={onEditHostname}
      host={host}
    />,
  ];
  const title = 'Illegal hostname';
  return hostnameValidations.length === 1 ? (
    <Alert title={title} variant={variant} actionLinks={actionLinks} isInline>
      {toSentence(hostnameValidations[0].message)}
    </Alert>
  ) : (
    <ValidationsAlert
      title={title}
      validations={hostnameValidations}
      variant={variant}
      actionLinks={actionLinks}
    />
  );
};

const NtpSyncAlert: React.FC<
  Required<AdditionNtpSourcePropsType> & { variant: AlertVariant; validation: Validation }
> = ({ AdditionalNTPSourcesDialogToggleComponent, variant, validation }) => {
  const actionLinks = [<AdditionalNTPSourcesDialogToggleComponent key="add-ntp-sources" />];
  return (
    <Alert title="NTP synchronization failure" variant={variant} actionLinks={actionLinks} isInline>
      {toSentence(validation.message)} {HOST_VALIDATION_FAILURE_HINTS[validation.id]}
    </Alert>
  );
};

const ApiVipConnectivityAlert: React.FC<
  Required<UpdateDay2ApiVipPropsType> & { variant: AlertVariant }
> = ({ UpdateDay2ApiVipDialogToggleComponent, variant }) => {
  const actionLinks = [<UpdateDay2ApiVipDialogToggleComponent key="update-api-vip" />];
  return (
    <Alert
      title="API Virtual IP connectivity failure"
      variant={variant}
      actionLinks={actionLinks}
      isInline
    >
      To continue installation, configure your DNS or alternatively
    </Alert>
  );
};

const ValidationGroupAlerts: React.FC<ValidationGroupAlertProps> = ({
  validations,
  title,
  variant,
  onEditHostname,
  AdditionalNTPSourcesDialogToggleComponent,
  UpdateDay2ApiVipDialogToggleComponent,
  host,
}) => {
  if (!validations.length) {
    return null;
  }
  const validationsWithActions: { [id in HostValidationId]?: Validation } = {
    ['hostname-unique']: undefined,
    ['hostname-valid']: undefined,
    ['ntp-synced']: undefined,
    ['api-vip-connected']: undefined,
  };
  const alerts = [];
  const validationsWithoutActions: Validation[] = [];
  for (const v of validations) {
    if (v.id in validationsWithActions && v.status === 'failure') {
      validationsWithActions[v.id] = v;
    } else {
      validationsWithoutActions.push(v);
    }
  }
  const hostnameValidations: Validation[] = [];
  if (validationsWithActions['hostname-unique']) {
    hostnameValidations.push(validationsWithActions['hostname-unique']);
  }
  if (validationsWithActions['hostname-valid']) {
    hostnameValidations.push(validationsWithActions['hostname-valid']);
  }
  if (hostnameValidations.length > 0 && onEditHostname) {
    alerts.push(
      <HostnameAlert
        hostnameValidations={hostnameValidations}
        variant={variant}
        onEditHostname={onEditHostname}
        host={host}
      />,
    );
  }
  if (validationsWithActions['api-vip-connected'] && UpdateDay2ApiVipDialogToggleComponent) {
    alerts.push(
      <ApiVipConnectivityAlert
        UpdateDay2ApiVipDialogToggleComponent={UpdateDay2ApiVipDialogToggleComponent}
        variant={variant}
      />,
    );
  }
  if (validationsWithActions['ntp-synced'] && AdditionalNTPSourcesDialogToggleComponent) {
    alerts.push(
      <NtpSyncAlert
        AdditionalNTPSourcesDialogToggleComponent={AdditionalNTPSourcesDialogToggleComponent}
        validation={validationsWithActions['ntp-synced']}
        variant={variant}
      />,
    );
  }
  if (validationsWithoutActions.length > 0) {
    alerts.push(
      <ValidationsAlert validations={validationsWithoutActions} variant={variant} title={title} />,
    );
  }
  return <AlertGroup>{alerts}</AlertGroup>;
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
            {!failedValidations.length && ( // display pending validations only if there are no failing validations
              <ValidationGroupAlerts
                variant={AlertVariant.info}
                title="Pending validations:"
                validations={pendingValidations}
                {...props}
              />
            )}
            <ValidationGroupAlerts
              variant={AlertVariant.warning}
              title="Failed validations:"
              validations={failedValidations}
              {...props}
            />
          </Fragment>
        );
      })}
    </>
  );
};
