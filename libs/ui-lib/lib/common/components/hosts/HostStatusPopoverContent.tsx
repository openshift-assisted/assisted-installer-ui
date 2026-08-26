import React from 'react';
import { Content, Stack, StackItem } from '@patternfly/react-core';
import { Host } from '@openshift-assisted/types/assisted-installer-service';
import { ExternalLink } from '../ui';
import { toSentence } from '../ui/table/utils';
import HostProgress from './HostProgress';
import { HostValidationGroups, ValidationInfoActionProps } from './HostValidationGroups';
import { getApproveNodesInClLink } from '../../config';
import { useTranslation } from '../../hooks/use-translation-wrapper';
import { ValidationsInfo } from '../../types/hosts';

export type HostStatusPopoverContentProps = ValidationInfoActionProps & {
  host: Host;
  validationsInfo: ValidationsInfo;
  details?: string;
  autoCSR?: boolean;
  additionalPopoverContent?: React.ReactNode;
  additionalBMHInfo?: React.ReactNode;
  openshiftVersion?: string;
};

const InstallingInProgressBody: React.FC<{ host: Host }> = ({ host }) => (
  <Content>
    <HostProgress host={host} />
  </Content>
);

const ErrorBody: React.FC<Pick<HostStatusPopoverContentProps, 'host' | 'details'>> = ({
  host,
  details,
}) => (
  <Content>
    <Content component="p">
      {details}
      <br />
      {toSentence(host.statusInfo)}
    </Content>
    <HostProgress host={host} />
  </Content>
);

const InstalledBody: React.FC<Pick<HostStatusPopoverContentProps, 'host' | 'details'>> = ({
  host,
  details,
}) => (
  <Content>
    <Content component="p">{details}</Content>
    <HostProgress host={host} />
  </Content>
);

const AddedToClusterBody: React.FC<
  Pick<HostStatusPopoverContentProps, 'host' | 'details' | 'autoCSR' | 'openshiftVersion'>
> = ({ host, details, autoCSR, openshiftVersion }) => {
  const { t } = useTranslation();
  return (
    <Content>
      <Content component="p">{details}</Content>
      {!autoCSR && (
        <>
          <br />
          {t(
            "ai:To finish adding nodes to the cluster, approve the join request inside OpenShift Console's Nodes section.",
          )}
          <br />
          {t('ai:It may take a few minutes for the join request to appear.')}
          <br />
          {t('ai:If you prefer using the CLI, follow the instructions in')}&nbsp;
          <ExternalLink href={getApproveNodesInClLink(openshiftVersion)}>
            {t('ai:How to approve nodes using the CLI')}
          </ExternalLink>
        </>
      )}
      <HostProgress host={host} />
    </Content>
  );
};

const DetailsOnlyBody: React.FC<Pick<HostStatusPopoverContentProps, 'details'>> = ({ details }) => (
  <Content>
    <Content component="p">{details}</Content>
  </Content>
);

const ValidationsBody: React.FC<HostStatusPopoverContentProps> = ({
  host,
  validationsInfo,
  openshiftVersion,
  additionalPopoverContent,
  additionalBMHInfo,
  details,
  onEditHostname,
  AdditionalNTPSourcesDialogToggleComponent,
  NtpSyncFailureMessageComponent,
  UpdateDay2ApiVipDialogToggleComponent,
}) => (
  <Stack hasGutter>
    {additionalPopoverContent}
    {details && (
      <StackItem>
        <Content component="p">{details}</Content>
      </StackItem>
    )}
    <StackItem>
      <HostValidationGroups
        validationsInfo={validationsInfo}
        openshiftVersion={openshiftVersion}
        host={host}
        onEditHostname={onEditHostname}
        AdditionalNTPSourcesDialogToggleComponent={AdditionalNTPSourcesDialogToggleComponent}
        NtpSyncFailureMessageComponent={NtpSyncFailureMessageComponent}
        UpdateDay2ApiVipDialogToggleComponent={UpdateDay2ApiVipDialogToggleComponent}
      />
      {additionalBMHInfo}
    </StackItem>
  </Stack>
);

const DETAILS_ONLY_STATUSES: Host['status'][] = [
  'preparing-for-installation',
  'preparing-successful',
  'installing',
  'unbinding-pending-user-action',
  'binding',
  'unbinding',
  'reclaiming',
  'reclaiming-rebooting',
];

const ERROR_STATUSES: Host['status'][] = ['error', 'cancelled', 'installing-pending-user-action'];

export const HostStatusPopoverContent: React.FC<HostStatusPopoverContentProps> = (props) => {
  const { host } = props;
  const status = host.status;

  if (status === 'installing-in-progress') {
    return <InstallingInProgressBody host={host} />;
  }

  if (ERROR_STATUSES.includes(status)) {
    return <ErrorBody host={host} details={props.details} />;
  }

  if (status === 'installed') {
    return <InstalledBody host={host} details={props.details} />;
  }

  if (status === 'added-to-existing-cluster') {
    return (
      <AddedToClusterBody
        host={host}
        details={props.details}
        autoCSR={props.autoCSR}
        openshiftVersion={props.openshiftVersion}
      />
    );
  }

  if (DETAILS_ONLY_STATUSES.includes(status)) {
    return <DetailsOnlyBody details={props.details} />;
  }

  return <ValidationsBody {...props} />;
};
