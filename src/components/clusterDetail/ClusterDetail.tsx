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
import { Cluster } from '../../api/types';
import { EventsModalButton } from '../ui/eventsModal';
import HostsTable from '../hosts/HostsTable';
import ClusterToolbar from '../clusters/ClusterToolbar';
import { ToolbarButton, ToolbarSecondaryGroup } from '../ui/Toolbar';
import Alerts from '../ui/Alerts';
import { downloadClusterInstallationLogs, getClusterDetailId } from './utils';
import { AlertsContext } from '../AlertsContextProvider';
import { canAbortInstallation, canDownloadClusterLogs } from '../hosts/utils';
import ClusterProgress from './ClusterProgress';
import { LaunchOpenshiftConsoleButton } from './ConsoleModal';
import KubeconfigDownload from './KubeconfigDownload';
import ClusterProperties from './ClusterProperties';
import { isSingleClusterMode, routeBasePath } from '../../config';
import ClusterDetailStatusVarieties, {
  useClusterStatusVarieties,
} from './ClusterDetailStatusVarieties';
import { useHostDialogsContext } from '../hosts/HostDialogsContext';

type ClusterDetailProps = {
  cluster: Cluster;
};

const ClusterDetail: React.FC<ClusterDetailProps> = ({ cluster }) => {
  const { addAlert } = React.useContext(AlertsContext);
  const { resetClusterDialog, cancelInstallationDialog } = useHostDialogsContext();
  const clusterVarieties = useClusterStatusVarieties(cluster);
  const { credentials, credentialsError } = clusterVarieties;

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
          <ClusterDetailStatusVarieties cluster={cluster} clusterVarieties={clusterVarieties} />
          <KubeconfigDownload
            status={cluster.status}
            clusterId={cluster.id}
            id={getClusterDetailId('button-download-kubeconfig')}
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
        <Alerts />
      </StackItem>
      <StackItem>
        <ClusterToolbar>
          {canAbortInstallation(cluster) && (
            <ToolbarButton
              id={getClusterDetailId('button-cancel-installation')}
              variant={ButtonVariant.danger}
              onClick={() => cancelInstallationDialog.open({ clusterId: cluster.id })}
            >
              Abort Installation
            </ToolbarButton>
          )}
          {cluster.status === 'error' && (
            <ToolbarButton
              id={getClusterDetailId('button-reset-cluster')}
              onClick={() => resetClusterDialog.open({ cluster })}
            >
              Reset Cluster
            </ToolbarButton>
          )}
          {['finalizing', 'installed'].includes(cluster.status) && (
            <LaunchOpenshiftConsoleButton
              isDisabled={!credentials || !!credentialsError}
              cluster={cluster}
              consoleUrl={credentials?.consoleUrl}
              id={getClusterDetailId('button-launch-console')}
            />
          )}
          <ToolbarButton
            variant={ButtonVariant.link}
            component={(props) => <Link to={`${routeBasePath}/clusters`} {...props} />}
            isHidden={isSingleClusterMode()}
            id={getClusterDetailId('button-back-to-all-clusters')}
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
