import { Alert, AlertActionLink, Text, TextContent } from '@patternfly/react-core';
import { downloadClusterInstallationLogs } from '../../../ocm/components/clusterDetail/utils';
import { RenderIf, toSentence } from '../../../common/components/ui';
import { Cluster, MonitoredOperator } from '../../../common/api/types';
import React from 'react';
import { pluralize } from 'humanize-plus';
import { useModalDialogsContext } from '../../../ocm/components/hosts/ModalDialogsContext';
import { canDownloadClusterLogs } from '../../../common/components/hosts';
import { useAlerts } from '../../../common/components/AlertsContextProvider';
import { getBugzillaLink, OPERATOR_LABELS } from '../../../common/config/constants';

type installationProgressWarningProps = {
  cluster: Cluster;
  totalHosts: number;
  failedHosts: number;
  title?: string;
  hostsType?: string;
  failedOperators?: MonitoredOperator[];
  message?: string;
  isCriticalNumberOfWorkersFailed?: boolean;
};

type successInstallationProps = {
  consoleUrl?: string;
};

const getFailedOperatorsNames = (failedOperators: MonitoredOperator[]): string => {
  let failedOperatorsNames = '';
  for (let i = 0; i < failedOperators.length; i++) {
    const operatorName = failedOperators[i].name;
    if (i > 0) {
      if (i == failedOperators.length - 1) failedOperatorsNames += ' and ';
      else failedOperatorsNames += ', ';
    }
    failedOperatorsNames += `${operatorName && OPERATOR_LABELS[operatorName]} (${
      operatorName && operatorName.toUpperCase()
    })`;
  }
  return failedOperatorsNames;
};

export const HostInstallationWarning: React.FC<installationProgressWarningProps> = ({
  cluster,
  failedHosts,
  totalHosts,
  title,
  hostsType,
  failedOperators = [],
  message,
}) => {
  const { addAlert } = useAlerts();

  return (
    <>
      &nbsp;
      <Alert
        isInline
        variant="warning"
        title={title}
        actionLinks={
          <>
            <AlertActionLink
              id="cluster-installation-logs-button"
              onClick={() => downloadClusterInstallationLogs(addAlert, cluster.id)}
              isDisabled={!canDownloadClusterLogs(cluster)}
            >
              Download installation logs
            </AlertActionLink>
          </>
        }
      >
        <RenderIf condition={failedHosts != 0}>
          <p>
            {failedHosts}/{totalHosts} {pluralize(totalHosts, hostsType)} {message} Due to this, the
            cluster will be degraded. Please check the installation log for more information.
          </p>
        </RenderIf>
        <RenderIf condition={failedOperators?.length > 0}>
          <p>
            {getFailedOperatorsNames(failedOperators)} failed to install. Due to this, the cluster
            will be degraded, but you can try to install the operator from the Operator Hub. Please
            check the installation log for more information.
          </p>
        </RenderIf>
      </Alert>
    </>
  );
};

export const HostsInstallationFailed: React.FC<installationProgressWarningProps> = ({
  cluster,
  failedHosts,
  totalHosts,
  isCriticalNumberOfWorkersFailed,
}) => {
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
      &nbsp;
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
              onClick={() => downloadClusterInstallationLogs(addAlert, cluster.id)}
              isDisabled={!canDownloadClusterLogs(cluster)}
            >
              Download installation logs
            </AlertActionLink>
            <AlertActionLink
              onClick={() => window.open(getBugzillaLink(cluster.openshiftVersion), '_blank')}
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

export const HostsInstallationSuccess: React.FC<successInstallationProps> = ({ consoleUrl }) => {
  return (
    <>
      &nbsp;
      <Alert
        isInline
        variant="success"
        title={'Installation completed successfully'}
        actionLinks={
          <>
            <RenderIf condition={typeof consoleUrl !== undefined}>
              <AlertActionLink
                id="cluster-installation-logs-button"
                onClick={() => window.open(consoleUrl, '_blank', 'noopener')}
              >
                Open web console
              </AlertActionLink>
            </RenderIf>
            <AlertActionLink id="cluster-installation-feedback-button">
              Send feedback
            </AlertActionLink>
          </>
        }
      >
        {' '}
      </Alert>
    </>
  );
};
