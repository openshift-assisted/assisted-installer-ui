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
import {
  ToolbarButton,
  ToolbarSecondaryGroup,
  Alerts,
  canDownloadClusterLogs,
  useAlerts,
  getEnabledHosts,
  selectOlmOperators,
  isSNO,
  useFeatureSupportLevel,
} from '../../../common';
import { Cluster } from '../../../common/api/types';
import ClusterHostsTable from '../hosts/ClusterHostsTable';
import ClusterToolbar from '../clusters/ClusterToolbar';
import { downloadClusterInstallationLogs, getClusterDetailId } from './utils';
import { LaunchOpenshiftConsoleButton } from '../../../common/components/clusterDetail/ConsoleModal';
import ClusterProperties from './ClusterProperties';
import { routeBasePath } from '../../config';
import ClusterDetailStatusVarieties, {
  useClusterStatusVarieties,
} from './ClusterDetailStatusVarieties';
import { useModalDialogsContext } from '../hosts/ModalDialogsContext';
import { canAbortInstallation } from '../clusters/utils';
import ClusterProgress from '../../../common/components/clusterDetail/ClusterProgress';
import ClusterProgressItems from '../../../common/components/clusterDetail/ClusterProgressItems';
import { onFetchEvents } from '../fetching/fetchEvents';
import { getClusterProgressAlerts } from './getProgressBarAlerts';
import { ClustersAPI } from '../../services/apis';
import { updateCluster } from '../../reducers/clusters';
import { handleApiError, ocmClient } from '../../api';
import ViewClusterEventsButton from '../../../common/components/ui/ViewClusterEventsButton';

type ClusterDetailProps = {
  cluster: Cluster;
};

const ClusterDetail: React.FC<ClusterDetailProps> = ({ cluster }) => {
  const { addAlert } = useAlerts();
  const { resetClusterDialog, cancelInstallationDialog } = useModalDialogsContext();
  const clusterVarieties = useClusterStatusVarieties(cluster);
  const { credentials, credentialsError } = clusterVarieties;
  const featureSupportLevelContext = useFeatureSupportLevel();
  const isSNOExpansionAllowed =
    cluster.openshiftVersion &&
    featureSupportLevelContext.isFeatureSupported(
      cluster.openshiftVersion,
      'SINGLE_NODE_EXPANSION',
    );
  const canAddHosts =
    (!isSNO(cluster) || isSNOExpansionAllowed) && cluster.status === 'installed' && !ocmClient;

  const onAddHosts = React.useCallback(() => {
    const doItAsync = async () => {
      try {
        const { data } = await ClustersAPI.allowAddHosts(cluster.id);
        updateCluster(data);
      } catch (e) {
        handleApiError(e);
      }
    };
    void doItAsync();
  }, [cluster.id]);

  return (
    <Stack hasGutter>
      <StackItem>
        <Grid hasGutter>
          <GridItem>
            <TextContent>
              <Text component="h2">Installation progress</Text>
            </TextContent>
          </GridItem>
          <GridItem span={6}>
            <ClusterProgress
              cluster={cluster}
              totalPercentage={cluster.progress?.totalPercentage || 0}
            />
          </GridItem>
          <GridItem span={6} rowSpan={4} />
          <GridItem span={6}>
            <ClusterProgressItems cluster={cluster} onFetchEvents={onFetchEvents} />
          </GridItem>
          <GridItem span={6}>
            {getClusterProgressAlerts(
              getEnabledHosts(cluster.hosts),
              cluster,
              selectOlmOperators(cluster),
            )}
          </GridItem>
          <GridItem span={6}>
            <ClusterDetailStatusVarieties cluster={cluster} clusterVarieties={clusterVarieties} />
          </GridItem>
          <GridItem>
            <TextContent>
              <Text component="h2">Host Inventory</Text>
            </TextContent>
            <ClusterHostsTable cluster={cluster} skipDisabled />
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
          {canAddHosts && (
            <ToolbarButton
              variant={ButtonVariant.primary}
              component={(props) => (
                <Link to={`${routeBasePath}/clusters/${cluster.id}`} {...props} />
              )}
              id={getClusterDetailId('button-add-hosts')}
              onClick={onAddHosts}
            >
              Add hosts
            </ToolbarButton>
          )}
          <ToolbarButton
            variant={ButtonVariant.link}
            component={(props) => <Link to={`${routeBasePath}/clusters`} {...props} />}
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
            <ViewClusterEventsButton cluster={cluster} onFetchEvents={onFetchEvents} />
          </ToolbarSecondaryGroup>
        </ClusterToolbar>
      </StackItem>
    </Stack>
  );
};

export default ClusterDetail;
