import React from 'react';
import { Alert, AlertActionLink, Content } from '@patternfly/react-core';
import { pluralize } from 'humanize-plus';
import {
  RenderIf,
  toSentence,
  canDownloadClusterLogs,
  getReportIssueLink,
  useAlerts,
} from '@openshift-assisted/common';
import { downloadClusterInstallationLogs } from './utils';
import { useModalDialogsContext } from '../hosts/ModalDialogsContext';
import { isInOcm } from '@openshift-assisted/common/api/axiosClient';
import { Cluster, MonitoredOperator } from '@openshift-assisted/types/assisted-installer-service';
import { useOperatorSpecs } from '@openshift-assisted/common/components/operators/operatorSpecs';

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

const getFailedHostsMessage = (
  failedHosts: number,
  totalHosts: number,
  message?: string,
  hostsType?: string,
) => {
  if (hostsType === 'worker') {
    if (isInOcm) {
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
  const { addAlert, clearAlerts } = useAlerts();
  const { byKey: opSpecs } = useOperatorSpecs();

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
                void downloadClusterInstallationLogs(addAlert, cluster.id, clearAlerts);
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
            {failedOperators.map(({ name }) => opSpecs[name || '']?.title || name).join(' and ')}{' '}
            failed to install. Due to this, the cluster will be degraded, but you can try to install
            the operator from the Operator Hub. Please check the installation log for more
            information.
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
  const { addAlert, clearAlerts } = useAlerts();
  const { resetClusterDialog } = useModalDialogsContext();
  const getID = (suffix: string) => `cluster-install-error-${suffix}`;
  let title, message;
  if (cluster.controlPlaneCount === 1 || failedHosts > 0) {
    title = 'Control plane was not installed';
    message = `${failedHosts}/${totalHosts} control plane nodes failed to install. Please check the installation logs for more information.`;
  } else if (isCriticalNumberOfWorkersFailed) {
    title = 'Critical number of workers were not installed';
    message =
      'Only one worker was able to be installed. Please check the installation logs for more information.';
  } else {
    title = 'Initialization failed';
    message = (
      <Content component="p">
        {toSentence(cluster.statusInfo)}
        <br />
        Reset the installation process to return to the configuration and try again. Some hosts may
        need to be re-registered by rebooting into the Discovery ISO.
      </Content>
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
                void downloadClusterInstallationLogs(addAlert, cluster.id, clearAlerts);
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

type ClusterInstallationTimeoutProps = {
  cluster: Cluster;
};

export const ClusterInstallationTimeout = ({ cluster }: ClusterInstallationTimeoutProps) => {
  const { addAlert, clearAlerts } = useAlerts();
  return (
    <>
      <Alert
        isInline
        variant="warning"
        title="Cluster installation is taking too long"
        actionLinks={
          <>
            <AlertActionLink
              id="cluster-installation-logs-button"
              onClick={() => {
                void downloadClusterInstallationLogs(addAlert, cluster.id, clearAlerts);
              }}
              isDisabled={!canDownloadClusterLogs(cluster)}
            >
              Download installation logs
            </AlertActionLink>
          </>
        }
      >
        Check the logs to find out why or reset the cluster to start over.
      </Alert>
    </>
  );
};
