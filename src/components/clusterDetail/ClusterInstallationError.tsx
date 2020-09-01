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

type ClusterInstallationErrorProps = {
  cluster: Cluster;
  setResetClusterModalOpen: (isOpen: boolean) => void;
};
const ClusterInstallationError: React.FC<ClusterInstallationErrorProps> = ({
  cluster,
  setResetClusterModalOpen,
}) => (
  <GridItem>
    <Alert
      variant={AlertVariant.danger}
      title={`Cluster installation failed`}
      actionLinks={
        <>
          <AlertActionLink onClick={() => setResetClusterModalOpen(true)}>
            Reset Cluster
          </AlertActionLink>
          {/* TODO(mlibra): Download cluster installation logs
          <AlertActionLink
            onClick={() => {
            }}
          >
            Download Installation Logs
          </AlertActionLink>
          */}
          <AlertActionLink
            onClick={() => {
              window.open(getBugzillaLink(cluster.openshiftVersion), '_blank');
            }}
          >
            Create A New Bugzilla
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

export default ClusterInstallationError;
