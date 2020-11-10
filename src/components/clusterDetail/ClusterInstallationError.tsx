import React from 'react';
import {
  GridItem,
  Alert,
  AlertVariant,
  AlertActionLink,
  TextContent,
  Text,
} from '@patternfly/react-core';
import { Cluster } from '../../api/types';
import { toSentence } from '../ui/table/utils';
import { getBugzillaLink } from '../../config';
import { AlertsContext } from '../AlertsContextProvider';
import { downloadClusterInstallationLogs } from './utils';
import { canDownloadClusterLogs } from '../hosts/utils';

type ClusterInstallationErrorProps = {
  cluster: Cluster;
  title?: string;
  setResetClusterModalOpen: (isOpen: boolean) => void;
};

const getID = (suffix: string) => `cluster-install-error-${suffix}`;

const ClusterInstallationError: React.FC<ClusterInstallationErrorProps> = ({
  cluster,
  title = 'Cluster installation failed',
  setResetClusterModalOpen,
}) => {
  const { addAlert } = React.useContext(AlertsContext);

  return (
    <GridItem>
      <Alert
        variant={AlertVariant.danger}
        title={title}
        actionLinks={
          <>
            <AlertActionLink
              onClick={() => setResetClusterModalOpen(true)}
              id={getID('button-reset-cluster')}
            >
              Reset Cluster
            </AlertActionLink>
            <AlertActionLink
              onClick={() => downloadClusterInstallationLogs(addAlert, cluster.id)}
              isDisabled={!canDownloadClusterLogs(cluster)}
              id={getID('button-download-installation-logs')}
            >
              Download Installation Logs
            </AlertActionLink>
            <AlertActionLink
              onClick={() => window.open(getBugzillaLink(cluster.openshiftVersion), '_blank')}
              id={getID('button-report-bug')}
            >
              Report a bug
            </AlertActionLink>
          </>
        }
        isInline
      >
        <TextContent>
          <Text component="p">
            {toSentence(cluster.statusInfo)}
            <br />
            Reset the installation process to return to the configuration and try again. Some hosts
            may need to be re-registered by rebooting into the Discovery ISO.
          </Text>
        </TextContent>
      </Alert>
    </GridItem>
  );
};

export default ClusterInstallationError;
