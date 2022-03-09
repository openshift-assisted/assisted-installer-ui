import {
  Alert,
  AlertActionCloseButton,
  AlertActionLink,
  Text,
  TextContent,
} from '@patternfly/react-core';
import { downloadClusterInstallationLogs } from '../../../ocm/components/clusterDetail/utils';
import { RenderIf, toSentence } from '../../../common/components/ui';
import { Cluster, MonitoredOperator } from '../../../common/api/types';
import React from 'react';
import { pluralize } from 'humanize-plus';
import { useModalDialogsContext } from '../../../ocm/components/hosts/ModalDialogsContext';
import { canDownloadClusterLogs } from '../../../common/components/hosts';
import { useAlerts } from '../../../common/components/AlertsContextProvider';
import { getBugzillaLink } from '../../../common/config/constants';

type installationProgressWarningProps = {
  cluster: Cluster;
  totalHosts: number;
  failedHosts: number;
  initializationFailed?: boolean;
  title?: string;
  hostsType?: string;
  failedOperators?: MonitoredOperator[];
  message?: string;
};

type successInstallationProps = {
  consoleUrl?: string;
};

const getFailedOperatorsNames = (failedOperators: MonitoredOperator[]): string => {
  let failedOperatorsNames = '';
  for (let i = 0; i < failedOperators.length; i++) {
    if (i > 0) {
      if (i == failedOperators.length) failedOperatorsNames += 'and ';
      else failedOperatorsNames += ', ';
    }
    failedOperatorsNames += `${failedOperators[i].name} operator`;
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
        actionClose={<AlertActionCloseButton onClose={() => alert('Clicked the close button')} />}
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
  initializationFailed,
  failedHosts,
  totalHosts,
  hostsType,
  title,
}) => {
  const { addAlert } = useAlerts();
  const { resetClusterDialog } = useModalDialogsContext();
  const getID = (suffix: string) => `cluster-install-error-${suffix}`;

  return (
    <>
      &nbsp;
      <Alert
        isInline
        variant="danger"
        title={title}
        actionClose={<AlertActionCloseButton onClose={() => alert('Clicked the close button')} />}
        actionLinks={
          <>
            <AlertActionLink
              id="cluster-reset-button-"
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
        <RenderIf condition={initializationFailed === false && hostsType === 'master'}>
          {failedHosts}/{totalHosts} masters failed to install. Please check the installation logs
          for more information.
        </RenderIf>
        <RenderIf condition={initializationFailed === false && hostsType === 'worker'}>
          Only one worker was able to be installed. Please check the installation logs for for more
          information.
        </RenderIf>
        <RenderIf condition={initializationFailed === true}>
          <TextContent>
            <Text component="p">
              {toSentence(cluster.statusInfo)}
              <br />
              Reset the installation process to return to the configuration and try again. Some
              hosts may need to be re-registered by rebooting into the Discovery ISO.
            </Text>
          </TextContent>
        </RenderIf>
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
        actionClose={<AlertActionCloseButton onClose={() => alert('Clicked the close button')} />}
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
      />
    </>
  );
};
