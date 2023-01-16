import React from 'react';
import { Alert, AlertActionLink, Text, TextContent } from '@patternfly/react-core';
import { pluralize } from 'humanize-plus';
import { TFunction } from 'i18next';
import {
  Cluster,
  MonitoredOperator,
  RenderIf,
  toSentence,
  canDownloadClusterLogs,
  getReportIssueLink,
  operatorLabels,
  useAlerts,
  OperatorName,
} from '../../../common';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';
import { downloadClusterInstallationLogs } from './utils';
import { useModalDialogsContext } from '../hosts/ModalDialogsContext';
import { ocmClient } from '../../api';

type InstallationProgressWarningProps = {
  cluster: Cluster;
  totalHosts: number;
  failedHosts: number;
  title?: string;
  hostsType?: string;
  failedOperators?: MonitoredOperator[];
  message?: string;
  isCriticalNumberOfWorkersFailed?: boolean;
};

const getFailedOperatorsNames = (failedOperators: MonitoredOperator[], t: TFunction): string => {
  let failedOperatorsNames = '';
  const translatedOperatorLabels = operatorLabels(t);
  for (let i = 0; i < failedOperators.length; i++) {
    const operatorName = (failedOperators[i].name as OperatorName) || '';
    const operatorLabel: string = (operatorName && translatedOperatorLabels[operatorName]) || '';
    if (i > 0) {
      if (i === failedOperators.length - 1) failedOperatorsNames += ' and ';
      else failedOperatorsNames += ', ';
    }
    failedOperatorsNames += `${operatorLabel} (${operatorName.toUpperCase()})`;
  }
  return failedOperatorsNames;
};

const getFailedHostsMessage = (
  failedHosts: number,
  totalHosts: number,
  message?: string,
  hostsType?: string,
) => {
  if (hostsType === 'worker') {
    if (ocmClient) {
      return (
        <>
          Error information for each host can be found in the host inventory table. To retry adding
          failed hosts, navigate to the clusters list inside OpenShift Cluster Manager, click your
          cluster name, and select the <b>Add hosts</b> tab.
        </>
      );
    }
    return (
      <>
        Error information for each host can be found in the host inventory table. To retry adding
        failed hosts, press the <b>Add hosts</b> button.
      </>
    );
  }
  return (
    <>
      {failedHosts}/{totalHosts} {pluralize(totalHosts, hostsType)} {message} Due to this, the
      cluster will be degraded. Please check the installation log for more information.
    </>
  );
};

export const HostInstallationWarning = ({
  cluster,
  failedHosts,
  totalHosts,
  title,
  hostsType,
  failedOperators = [],
  message,
}: InstallationProgressWarningProps) => {
  const { addAlert } = useAlerts();
  const { t } = useTranslation();
  return (
    <>
      <Alert
        isInline
        variant="warning"
        title={title}
        actionLinks={
          <>
            <AlertActionLink
              id="cluster-installation-logs-button"
              onClick={() => {
                void downloadClusterInstallationLogs(addAlert, cluster.id);
              }}
              isDisabled={!canDownloadClusterLogs(cluster)}
            >
              Download installation logs
            </AlertActionLink>
          </>
        }
      >
        <RenderIf condition={failedHosts !== 0}>
          <p>{getFailedHostsMessage(failedHosts, totalHosts, message, hostsType)}</p>
        </RenderIf>
        <RenderIf condition={failedOperators?.length > 0}>
          <p>
            {getFailedOperatorsNames(failedOperators, t)} failed to install. Due to this, the
            cluster will be degraded, but you can try to install the operator from the Operator Hub.
            Please check the installation log for more information.
          </p>
        </RenderIf>
      </Alert>
    </>
  );
};

export const HostsInstallationFailed = ({
  cluster,
  failedHosts,
  totalHosts,
  isCriticalNumberOfWorkersFailed,
}: InstallationProgressWarningProps) => {
  const { addAlert } = useAlerts();
  const { resetClusterDialog } = useModalDialogsContext();
  const getID = (suffix: string) => `cluster-install-error-${suffix}`;
  let title, message;
  if (cluster.highAvailabilityMode === 'None' || failedHosts > 0) {
    title = 'Control plane was not installed';
    message = `${failedHosts}/${totalHosts} control plane nodes failed to install. Please check the installation logs for more information.`;
  } else if (isCriticalNumberOfWorkersFailed) {
    title = 'Critical number of workers were not installed';
    message =
      'Only one worker was able to be installed. Please check the installation logs for more information.';
  } else {
    title = 'Initialization failed';
    message = (
      <TextContent>
        <Text component="p">
          {toSentence(cluster.statusInfo)}
          <br />
          Reset the installation process to return to the configuration and try again. Some hosts
          may need to be re-registered by rebooting into the Discovery ISO.
        </Text>
      </TextContent>
    );
  }

  return (
    <>
      <Alert
        isInline
        variant="danger"
        title={title}
        actionLinks={
          <>
            <AlertActionLink
              id="button-reset-cluster"
              onClick={() => resetClusterDialog.open({ cluster })}
            >
              Reset Cluster
            </AlertActionLink>
            <AlertActionLink
              id="cluster-installation-logs-button"
              onClick={() => {
                void downloadClusterInstallationLogs(addAlert, cluster.id);
              }}
              isDisabled={!canDownloadClusterLogs(cluster)}
            >
              Download installation logs
            </AlertActionLink>
            <AlertActionLink
              onClick={() => window.open(getReportIssueLink(), '_blank')}
              id={getID('button-report-bug')}
            >
              Report a bug
            </AlertActionLink>
          </>
        }
      >
        {message}
      </Alert>
    </>
  );
};

export const HostsInstallationSuccess = () => {
  return (
    <>
      <Alert isInline variant="success" title={'Installation completed successfully'}>
        {' '}
      </Alert>
    </>
  );
};
