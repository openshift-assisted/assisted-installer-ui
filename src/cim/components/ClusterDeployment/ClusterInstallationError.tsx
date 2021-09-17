import React from 'react';
import { saveAs } from 'file-saver';
import { GridItem, Alert, AlertVariant, AlertActionLink } from '@patternfly/react-core';
import { toSentence } from '../../../common/components/ui/table/utils';
import { getBugzillaLink } from '../../../common/config';
import { AgentClusterInstallK8sResource, ClusterDeploymentK8sResource } from '../../types';
import { k8sProxyURL } from '../helpers/proxy';
import { getClusterStatus } from '../helpers';

type ClusterInstallationErrorProps = {
  clusterDeployment: ClusterDeploymentK8sResource;
  agentClusterInstall?: AgentClusterInstallK8sResource;
  backendURL: string;
};

const getID = (suffix: string) => `cluster-install-error-${suffix}`;

const getLogsURL = (backendURL: string, agentClusterInstall?: AgentClusterInstallK8sResource) => {
  if (agentClusterInstall?.status?.debugInfo?.logsURL) {
    const logsURL = new URL(agentClusterInstall.status?.debugInfo?.logsURL);
    return `${backendURL}${k8sProxyURL}${logsURL.pathname}${logsURL.search}`;
  }
  return null;
};

const ClusterInstallationError: React.FC<ClusterInstallationErrorProps> = ({
  clusterDeployment,
  backendURL,
  agentClusterInstall,
}) => {
  const openshiftVersion = clusterDeployment.status?.installVersion || '4.8';
  const [clusterStatus, statusInfo] = getClusterStatus(agentClusterInstall);
  const title =
    clusterStatus === 'cancelled'
      ? 'Cluster installation was cancelled'
      : 'Cluster installation failed';
  const logsURL = getLogsURL(backendURL, agentClusterInstall);
  return (
    <GridItem>
      <Alert
        variant={AlertVariant.danger}
        title={title}
        actionLinks={
          <>
            <AlertActionLink
              onClick={() => logsURL && saveAs(logsURL)}
              isDisabled={!logsURL}
              id={getID('button-download-installation-logs')}
            >
              Download Installation Logs
            </AlertActionLink>
            <AlertActionLink
              onClick={() => window.open(getBugzillaLink(openshiftVersion), '_blank')}
              id={getID('button-report-bug')}
            >
              Report a bug
            </AlertActionLink>
          </>
        }
        isInline
      >
        {toSentence(statusInfo)}
      </Alert>
    </GridItem>
  );
};

export default ClusterInstallationError;
