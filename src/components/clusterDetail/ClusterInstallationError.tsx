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
  setResetClusterModalOpen: (isOpen: boolean) => void;
};
const ClusterInstallationError: React.FC<ClusterInstallationErrorProps> = ({
  cluster,
  setResetClusterModalOpen,
}) => {
  const { addAlert } = React.useContext(AlertsContext);

  return (
    <GridItem>
      <Alert
        variant={AlertVariant.danger}
        title={`Cluster installation failed`}
        actionLinks={
          <>
            <AlertActionLink onClick={() => setResetClusterModalOpen(true)}>
              Reset Cluster
            </AlertActionLink>
            <AlertActionLink
              onClick={() => downloadClusterInstallationLogs(addAlert, cluster.id)}
              isDisabled={!canDownloadClusterLogs(cluster)}
            >
              Download Installation Logs
            </AlertActionLink>
            <AlertActionLink
              onClick={() => window.open(getBugzillaLink(cluster.openshiftVersion), '_blank')}
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
