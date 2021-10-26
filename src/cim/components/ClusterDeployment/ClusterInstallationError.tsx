import React from 'react';
import { GridItem, Alert, AlertVariant, AlertActionLink } from '@patternfly/react-core';
import { toSentence } from '../../../common/components/ui/table/utils';
import { getBugzillaLink } from '../../../common/config';
import { AgentClusterInstallK8sResource, ClusterDeploymentK8sResource } from '../../types';
import { getClusterStatus } from '../helpers';
import { LogsDownloadButton } from './LogsDownloadButton';

type ClusterInstallationErrorProps = {
  clusterDeployment: ClusterDeploymentK8sResource;
  agentClusterInstall?: AgentClusterInstallK8sResource;
};

const getID = (suffix: string) => `cluster-install-error-${suffix}`;

const ClusterInstallationError: React.FC<ClusterInstallationErrorProps> = ({
  clusterDeployment,
  agentClusterInstall,
}) => {
  const openshiftVersion = clusterDeployment.status?.installVersion || '4.8';
  const [clusterStatus, statusInfo] = getClusterStatus(agentClusterInstall);
  const title =
    clusterStatus === 'cancelled'
      ? 'Cluster installation was cancelled'
      : 'Cluster installation failed';

  return (
    <GridItem>
      <Alert
        variant={AlertVariant.danger}
        title={title}
        actionLinks={
          <>
            <LogsDownloadButton
              id={getID('button-download-installation-logs')}
              Component={AlertActionLink}
              agentClusterInstall={agentClusterInstall}
            />
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
