import React, { Fragment, ReactElement } from 'react';
import { Alert, AlertGroup, AlertVariant, Level, LevelItem } from '@patternfly/react-core';
import { t_global_icon_color_status_warning_default as warningColor } from '@patternfly/react-tokens/dist/js/t_global_icon_color_status_warning_default';
import { t_global_color_status_success_default as okColor } from '@patternfly/react-tokens/dist/js/t_global_color_status_success_default';
import { PendingIcon } from '@patternfly/react-icons/dist/js/icons/pending-icon';
import { CheckCircleIcon } from '@patternfly/react-icons/dist/js/icons/check-circle-icon';
import { ExclamationTriangleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-triangle-icon';

import { Host, HostValidationId } from '@openshift-assisted/types/assisted-installer-service';
import { Validation, ValidationsInfo } from '../../types/hosts';
import {
  getMtuLink,
  hostValidationFailureHints,
  hostValidationGroupLabels,
  hostValidationLabels,
} from '../../config';
import { toSentence } from '../ui';
import Hostname from './Hostname';
import { useTranslation } from '../../hooks/use-translation-wrapper';
import { getKeys } from '../../utils';

import './HostValidationGroups.css';
import { ExternalLinkAltIcon } from '@patternfly/react-icons/dist/js/icons/external-link-alt-icon';

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
  openshiftVersion?: string;
};

type ValidationGroupAlertProps = ValidationInfoActionProps & {
  variant: AlertVariant;
  validations: Validation[];
  title: string;
};

const ValidationsAlert = ({
  validations,
  variant,
  title,
  actionLinks = [],
}: {
  validations: Validation[];
  variant: AlertVariant;
  title: string;
  actionLinks?: ReactElement[];
}) => {
  const { t } = useTranslation();
  return (
    <Alert title={title} variant={variant} actionLinks={actionLinks} isInline>
      <ul>
        {validations.map((v) => (
          <li key={v.id}>
            <strong>{hostValidationLabels(t)[v.id] || v.id}:</strong>&nbsp;
            {toSentence(v.message.replace(/\\n/, ' '))}{' '}
            {v.status === 'failure' && hostValidationFailureHints(t)[v.id]}
          </li>
        ))}
      </ul>
    </Alert>
  );
};

const HostnameAlert = ({
  onEditHostname,
  host,
  hostnameValidations,
  variant,
}: Required<InvalidHostnameActionProps> & {
  hostnameValidations: Validation[];
  variant: AlertVariant;
}) => {
  const { t } = useTranslation();
  const actionLinks = [
    <Hostname
      key="change-hostname"
      title={t('ai:Change hostname')}
      onEditHostname={onEditHostname}
      host={host}
    />,
  ];
  const title = t('ai:Illegal hostname');
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

const NtpSyncAlert = ({
  AdditionalNTPSourcesDialogToggleComponent,
  variant,
  validation,
}: Required<AdditionNtpSourcePropsType> & { variant: AlertVariant; validation: Validation }) => {
  const actionLinks = [<AdditionalNTPSourcesDialogToggleComponent key="add-ntp-sources" />];
  const { t } = useTranslation();
  return (
    <Alert
      title={t('ai:NTP synchronization failure')}
      variant={variant}
      actionLinks={actionLinks}
      isInline
    >
      {toSentence(validation.message)} {hostValidationFailureHints(t)[validation.id]}
    </Alert>
  );
};

const ApiVipConnectivityAlert = ({
  UpdateDay2ApiVipDialogToggleComponent,
  variant,
  validation,
}: Required<UpdateDay2ApiVipPropsType> & { variant: AlertVariant; validation: Validation }) => {
  const actionLinks = [<UpdateDay2ApiVipDialogToggleComponent key="update-api-vip" />];
  const { t } = useTranslation();
  return (
    <Alert
      title={t('ai:API connectivity failure')}
      variant={variant}
      actionLinks={actionLinks}
      isInline
    >
      {toSentence(validation.message)}
    </Alert>
  );
};

const MtuInfoLink = ({ docsVersion }: { docsVersion: string }) => {
  const { t } = useTranslation();
  return (
    <a href={getMtuLink(docsVersion)} target="_blank" rel="noopener noreferrer">
      {t('ai:Learn more about MTU (maximum transmission unit)')} <ExternalLinkAltIcon />.
    </a>
  );
};

const MtuSyncAlert = ({
  variant,
  validation,
  docsVersion,
}: {
  variant: AlertVariant;
  validation: Validation;
  docsVersion: string;
}) => {
  const { t } = useTranslation();
  return (
    <Alert title={t('ai:MTU (maximum transmission unit) failure')} variant={variant} isInline>
      {toSentence(validation.message)} {hostValidationFailureHints(t)[validation.id]}
      <br />
      {<MtuInfoLink docsVersion={docsVersion} />}
    </Alert>
  );
};

const ValidationGroupAlerts = ({
  validations,
  title,
  variant,
  onEditHostname,
  AdditionalNTPSourcesDialogToggleComponent,
  UpdateDay2ApiVipDialogToggleComponent,
  host,
  openshiftVersion,
}: ValidationGroupAlertProps & { openshiftVersion?: string }) => {
  if (!validations.length) {
    return null;
  }
  const validationsWithActions: { [id in HostValidationId]?: Validation } = {
    ['hostname-unique']: undefined,
    ['hostname-valid']: undefined,
    ['ntp-synced']: undefined,
    ['ignition-downloadable']: undefined,
    ['mtu-valid']: undefined,
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
        key="hostname-alert"
      />,
    );
  }
  if (validationsWithActions['ignition-downloadable'] && UpdateDay2ApiVipDialogToggleComponent) {
    alerts.push(
      <ApiVipConnectivityAlert
        UpdateDay2ApiVipDialogToggleComponent={UpdateDay2ApiVipDialogToggleComponent}
        validation={validationsWithActions['ignition-downloadable']}
        variant={variant}
        key="ignition-downloadable-alert"
      />,
    );
  }
  if (validationsWithActions['ntp-synced'] && AdditionalNTPSourcesDialogToggleComponent) {
    alerts.push(
      <NtpSyncAlert
        AdditionalNTPSourcesDialogToggleComponent={AdditionalNTPSourcesDialogToggleComponent}
        validation={validationsWithActions['ntp-synced']}
        variant={variant}
        key="ntp-sync-alert"
      />,
    );
  }
  if (validationsWithActions['mtu-valid'] && AdditionalNTPSourcesDialogToggleComponent) {
    alerts.push(
      <MtuSyncAlert
        validation={validationsWithActions['mtu-valid']}
        variant={variant}
        key="mtu-sync-alert"
        docsVersion={openshiftVersion || '4.17'}
      />,
    );
  }
  if (validationsWithoutActions.length > 0) {
    alerts.push(
      <ValidationsAlert
        validations={validationsWithoutActions}
        variant={variant}
        title={title}
        key="insufficient-alert"
      />,
    );
  }
  return <AlertGroup>{alerts}</AlertGroup>;
};

export const HostValidationGroups = ({
  validationsInfo,
  openshiftVersion,
  ...props
}: HostValidationGroupsProps) => {
  const { t } = useTranslation();
  return (
    <>
      {getKeys(validationsInfo).map((groupName) => {
        const validations = validationsInfo[groupName] || [];
        const pendingValidations = validations.filter(
          (v) => v.status === 'pending' && v.id !== 'ntp-synced',
        );
        const failedValidations = validations.filter(
          (v) => (v.status === 'failure' || v.status === 'error') && v.id !== 'ntp-synced',
        );
        const softValidations = validations.filter(
          (v) => ['pending', 'failure', 'error'].includes(v.status) && v.id === 'ntp-synced',
        );

        const getValidationGroupState = () => {
          if (failedValidations.length) {
            return (
              <>
                {t('ai:Failed')} <ExclamationTriangleIcon color={warningColor.value} />
              </>
            );
          } else if (pendingValidations.length) {
            return (
              <>
                {t('ai:Pending input')} <PendingIcon />
              </>
            );
          }
          return (
            <>
              {t('ai:Ready')} <CheckCircleIcon color={okColor.value} />
            </>
          );
        };
        const groupLabel = hostValidationGroupLabels(t)[groupName] as string;
        return (
          <Fragment key={groupName}>
            <Level className="host-validation-groups__validation-group">
              <LevelItem>
                <strong>{groupLabel}</strong>
              </LevelItem>
              <LevelItem>{getValidationGroupState()}</LevelItem>
            </Level>
            {
              // display pending and soft validations only if there are no failing validations
              !failedValidations.length && (
                <>
                  <ValidationGroupAlerts
                    variant={AlertVariant.info}
                    title={t('ai:Pending validations:')}
                    validations={pendingValidations}
                    openshiftVersion={openshiftVersion}
                    {...props}
                  />
                  <ValidationGroupAlerts
                    variant={AlertVariant.info}
                    validations={softValidations}
                    openshiftVersion={openshiftVersion}
                    title={''}
                    {...props}
                  />
                </>
              )
            }
            <ValidationGroupAlerts
              variant={AlertVariant.warning}
              title={t('ai:Failed validations:')}
              validations={failedValidations}
              openshiftVersion={openshiftVersion}
              {...props}
            />
          </Fragment>
        );
      })}
    </>
  );
};
