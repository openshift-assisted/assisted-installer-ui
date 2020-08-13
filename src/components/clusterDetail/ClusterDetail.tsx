import React from 'react';
import { Link } from 'react-router-dom';
import {
  PageSectionVariants,
  TextContent,
  Text,
  ButtonVariant,
  GridItem,
  Grid,
} from '@patternfly/react-core';
import { Cluster, Credentials } from '../../api/types';
import { getClusterCredentials } from '../../api/clusters';
import PageSection from '../ui/PageSection';
import { EventsModalButton } from '../ui/eventsModal';
import HostsTable from '../hosts/HostsTable';
import ClusterToolbar from '../clusters/ClusterToolbar';
import { ToolbarButton, ToolbarSecondaryGroup } from '../ui/Toolbar';
import ClusterBreadcrumbs from '../clusters/ClusterBreadcrumbs';
import ClusterProgress from './ClusterProgress';
import ClusterCredentials from './ClusterCredentials';
import ClusterInstallationError from './ClusterInstallationError';
import { LaunchOpenshiftConsoleButton } from './ConsoleModal';
import KubeconfigDownload from './KubeconfigDownload';
import FeedbackAlert from './FeedbackAlert';
import ClusterProperties from './ClusterProperties';
import { routeBasePath } from '../../config';
import FailedHostsWarning from './FailedHostsWarning';
import AlertsSection from '../ui/AlertsSection';

const canAbortInstallation = (cluster: Cluster) => {
  if (
    !['preparing-for-installation', 'installing', 'installing-in-progress'].includes(cluster.status)
  ) {
    return false;
  }

  if (cluster.hosts) {
    if (cluster.hosts.find((h) => h.status === 'installing-pending-user-action')) {
      // a host in installing-pending-user-action
      return false;
    }

    if (cluster.hosts.find((h) => h.status === 'error')) {
      // a host is in error
      if (cluster.hosts.find((h) => h.status !== 'installing')) {
        // no host is in installing
        if (
          cluster.hosts.find(
            (h) => !['error', 'installed', 'preparing-for-installation'].includes(h.status),
          )
        ) {
          // a host not yet in error or installed or preparing-for-installation
          return false;
        }
      }
    }
  }

  return true;
};

type ClusterDetailProps = {
  cluster: Cluster;
  setCancelInstallationModalOpen: (isOpen: boolean) => void;
  setResetClusterModalOpen: (isOpen: boolean) => void;
};

const ClusterDetail: React.FC<ClusterDetailProps> = ({
  cluster,
  setCancelInstallationModalOpen,
  setResetClusterModalOpen,
}) => {
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
    if (cluster.status === 'installed') {
      fetchCredentials();
    }
  }, [cluster.status, fetchCredentials]);

  return (
    <>
      <ClusterBreadcrumbs clusterName={cluster.name} />
      <PageSection variant={PageSectionVariants.light} isMain>
        <Grid hasGutter>
          <GridItem>
            <TextContent>
              <Text component="h1">Installation progress: {cluster.name}</Text>
            </TextContent>
          </GridItem>
          <GridItem>
            <ClusterProgress cluster={cluster} />
          </GridItem>
          {cluster.status === 'installed' && <FailedHostsWarning cluster={cluster} />}
          {cluster.status === 'error' && (
            <ClusterInstallationError
              cluster={cluster}
              setResetClusterModalOpen={setResetClusterModalOpen}
            />
          )}
          {cluster.status === 'installed' && (
            <ClusterCredentials
              cluster={cluster}
              credentials={credentials}
              error={!!credentialsError}
              retry={fetchCredentials}
            />
          )}
          <KubeconfigDownload status={cluster.status} clusterId={cluster.id} />
          <FeedbackAlert />
          <GridItem>
            <TextContent>
              <Text component="h2">Bare Metal Inventory</Text>
            </TextContent>
            <HostsTable cluster={cluster} skipDisabled />
          </GridItem>
          <ClusterProperties cluster={cluster} />
        </Grid>
      </PageSection>
      <AlertsSection />
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
          <ToolbarButton onClick={() => setResetClusterModalOpen(true)}>
            Reset Cluster
          </ToolbarButton>
        )}
        {cluster.status === 'installed' && (
          <LaunchOpenshiftConsoleButton
            isDisabled={!credentials || !!credentialsError}
            cluster={cluster}
            consoleUrl={credentials?.consoleUrl}
          />
        )}
        <ToolbarButton
          variant={ButtonVariant.link}
          component={(props) => <Link to={`${routeBasePath}/clusters`} {...props} />}
        >
          Back to all clusters
        </ToolbarButton>
        <ToolbarSecondaryGroup>
          <EventsModalButton
            id="cluster-events-button"
            entityKind="cluster"
            entityId={cluster.id}
            title="Cluster Events"
            variant={ButtonVariant.link}
            style={{ textAlign: 'right' }}
          >
            View Cluster Events
          </EventsModalButton>
        </ToolbarSecondaryGroup>
      </ClusterToolbar>
    </>
  );
};

export default ClusterDetail;
