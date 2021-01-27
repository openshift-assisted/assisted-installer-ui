import React from 'react';
import { Link } from 'react-router-dom';
import {
  Stack,
  StackItem,
  TextContent,
  Text,
  ButtonVariant,
  GridItem,
  Grid,
} from '@patternfly/react-core';
import { Cluster, Credentials } from '../../api/types';
import { getClusterCredentials } from '../../api/clusters';
import { EventsModalButton } from '../ui/eventsModal';
import HostsTable from '../hosts/HostsTable';
import ClusterToolbar from '../clusters/ClusterToolbar';
import { ToolbarButton, ToolbarSecondaryGroup } from '../ui/Toolbar';
import ClusterProgress from './ClusterProgress';
import ClusterCredentials from './ClusterCredentials';
import ClusterInstallationError from './ClusterInstallationError';
import { LaunchOpenshiftConsoleButton } from './ConsoleModal';
import KubeconfigDownload from './KubeconfigDownload';
import ClusterProperties from './ClusterProperties';
import { isSingleClusterMode, routeBasePath } from '../../config';
import FailedHostsWarning from './FailedHostsWarning';
import AlertsSection from '../ui/AlertsSection';
import { downloadClusterInstallationLogs } from './utils';
import { AlertsContext } from '../AlertsContextProvider';
import { canDownloadClusterLogs } from '../hosts/utils';

const canAbortInstallation = (cluster: Cluster) => {
  const allowedClusterStates: Cluster['status'][] = [
    'preparing-for-installation',
    'installing',
    'installing-pending-user-action',
    'finalizing',
  ];
  return allowedClusterStates.includes(cluster.status);
};

type ClusterDetailProps = {
  cluster: Cluster;
  setCancelInstallationModalOpen: (isOpen: boolean) => void;
  setResetClusterModalOpen: (isOpen: boolean) => void;
};

const getID = (suffix: string) => `cluster-detail-${suffix}`;

const ClusterDetail: React.FC<ClusterDetailProps> = ({
  cluster,
  setCancelInstallationModalOpen,
  setResetClusterModalOpen,
}) => {
  const { addAlert } = React.useContext(AlertsContext);
  const [credentials, setCredentials] = React.useState<Credentials>();
  const [credentialsError, setCredentialsError] = React.useState();

  const fetchCredentials = React.useCallback(() => {
    const fetch = async () => {
      setCredentialsError(undefined);
      try {
        const response = await getClusterCredentials(cluster.id);
        setCredentials(response.data);
      } catch (err) {
        setCredentialsError(err);
      }
    };
    fetch();
  }, [cluster.id]);

  React.useEffect(() => {
    if (['finalizing', 'installed'].includes(cluster.status)) {
      fetchCredentials();
    }
  }, [cluster.status, fetchCredentials]);

  return (
    <Stack hasGutter>
      <StackItem>
        <Grid hasGutter>
          <GridItem>
            <TextContent>
              <Text component="h2">Installation progress</Text>
            </TextContent>
          </GridItem>
          <GridItem>
            <ClusterProgress cluster={cluster} />
          </GridItem>
          {['installed', 'installing', 'installing-pending-user-action', 'finalizing'].includes(
            cluster.status,
          ) && <FailedHostsWarning cluster={cluster} />}
          {cluster.status === 'error' && (
            <ClusterInstallationError
              cluster={cluster}
              setResetClusterModalOpen={setResetClusterModalOpen}
            />
          )}
          {cluster.status === 'cancelled' && (
            <ClusterInstallationError
              title="Cluster installation was cancelled"
              cluster={cluster}
              setResetClusterModalOpen={setResetClusterModalOpen}
            />
          )}
          {['finalizing', 'installed'].includes(cluster.status) && (
            <ClusterCredentials
              cluster={cluster}
              credentials={credentials}
              error={!!credentialsError}
              retry={fetchCredentials}
              idPrefix={getID('cluster-creds')}
            />
          )}
          <KubeconfigDownload
            status={cluster.status}
            clusterId={cluster.id}
            id={getID('button-download-kubeconfig')}
          />
          <GridItem>
            <TextContent>
              <Text component="h2">Bare Metal Inventory</Text>
            </TextContent>
            <HostsTable cluster={cluster} skipDisabled />
          </GridItem>
          <ClusterProperties cluster={cluster} />
        </Grid>
      </StackItem>
      <StackItem>
        <AlertsSection />
      </StackItem>
      <StackItem>
        <ClusterToolbar>
          {canAbortInstallation(cluster) && (
            <ToolbarButton
              variant={ButtonVariant.danger}
              onClick={() => setCancelInstallationModalOpen(true)}
            >
              Abort Installation
            </ToolbarButton>
          )}
          {cluster.status === 'error' && (
            <ToolbarButton
              id={getID('button-reset-cluster')}
              onClick={() => setResetClusterModalOpen(true)}
            >
              Reset Cluster
            </ToolbarButton>
          )}
          {['finalizing', 'installed'].includes(cluster.status) && (
              <LaunchOpenshiftConsoleButton
              isDisabled={!credentials || !!credentialsError}
              cluster={cluster}
              consoleUrl={credentials?.consoleUrl}
              id={getID('button-launch-console')}
            />
          )}
          <ToolbarButton
            variant={ButtonVariant.link}
            component={(props) => <Link to={`${routeBasePath}/clusters`} {...props} />}
            isHidden={isSingleClusterMode()}
            id={getID('button-back-to-all-clusters')}
          >
            Back to all clusters
          </ToolbarButton>
          <ToolbarSecondaryGroup>
            <ToolbarButton
              id="cluster-installation-logs-button"
              variant={ButtonVariant.link}
              onClick={() => downloadClusterInstallationLogs(addAlert, cluster.id)}
              isDisabled={!canDownloadClusterLogs(cluster)}
            >
              Download Installation Logs
            </ToolbarButton>
            <EventsModalButton
              id="cluster-events-button"
              entityKind="cluster"
              cluster={cluster}
              title="Cluster Events"
              variant={ButtonVariant.link}
            >
              View Cluster Events
            </EventsModalButton>
          </ToolbarSecondaryGroup>
        </ClusterToolbar>
      </StackItem>
    </Stack>
  );
};

export default ClusterDetail;
