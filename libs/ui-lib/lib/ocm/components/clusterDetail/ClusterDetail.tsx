import React from 'react';
import { useNavigate } from 'react-router';
import { Stack, StackItem, Content, ButtonVariant, GridItem, Grid } from '@patternfly/react-core';
import { Cluster } from '@openshift-assisted/types/assisted-installer-service';
import {
  ToolbarButton,
  Alerts,
  getEnabledHosts,
  selectOlmOperators,
  isSNO,
  handleApiError,
  isInOcm,
  useNewFeatureSupportLevel,
  ClusterProgress,
} from '../../../common';
import { routeBasePath } from '../../config';
import { ClustersAPI } from '../../services/apis';
import { useFeature } from '../../hooks/use-feature';
import { updateCluster } from '../../store/slices/current-cluster/slice';
import { onFetchEvents } from '../fetching/fetchEvents';
import {
  ClusterToolbar,
  ClusterDetailsButtonGroup,
  OcmClusterProgressItems,
  ClusterSummaryExpandable,
  HostInventoryExpandable,
  getProgressAlerts,
  ClusterDetailStatusVarieties,
  useClusterStatusVarieties,
} from './components';
import { getClusterDetailId } from './utils';

type ClusterDetailProps = {
  cluster: Cluster;
};

export const ClusterDetail: React.FC<ClusterDetailProps> = ({ cluster }) => {
  const clusterVarieties = useClusterStatusVarieties(cluster);
  const featureSupportLevelContext = useNewFeatureSupportLevel();
  const isSNOExpansionAllowed =
    featureSupportLevelContext.isFeatureSupported('SINGLE_NODE_EXPANSION');
  const isSingleClusterFeatureEnabled = useFeature('ASSISTED_INSTALLER_SINGLE_CLUSTER_FEATURE');
  const navigate = useNavigate();
  const canAddHosts =
    (!isSNO(cluster) || isSNOExpansionAllowed) && cluster.status === 'installed' && !isInOcm;

  const onAddHosts = React.useCallback(() => {
    const doItAsync = async () => {
      try {
        const { data } = await ClustersAPI.allowAddHosts(cluster.id);
        updateCluster(data);
        void navigate(`${routeBasePath}/clusters/${cluster.id}`);
      } catch (e) {
        handleApiError(e);
      }
    };
    void doItAsync();
  }, [cluster.id, navigate]);

  return (
    <Stack hasGutter>
      <StackItem>
        <Grid hasGutter>
          <GridItem>
            <Content component="h2">Installation progress</Content>
          </GridItem>
          <GridItem span={6}>
            <ClusterProgress
              cluster={cluster}
              totalPercentage={cluster.progress?.totalPercentage || 0}
            />
          </GridItem>
          <GridItem span={6} rowSpan={4} />
          <GridItem span={6}>
            <OcmClusterProgressItems cluster={cluster} onFetchEvents={onFetchEvents} />
          </GridItem>
          <GridItem span={6}>
            {getProgressAlerts(
              getEnabledHosts(cluster.hosts),
              cluster,
              selectOlmOperators(cluster),
            )}
          </GridItem>
          <GridItem span={6}>
            <ClusterDetailsButtonGroup
              cluster={cluster}
              credentials={clusterVarieties.credentials}
              credentialsError={clusterVarieties.credentialsError}
            />
            <ClusterDetailStatusVarieties cluster={cluster} clusterVarieties={clusterVarieties} />
          </GridItem>
          <HostInventoryExpandable cluster={cluster} />
          <ClusterSummaryExpandable cluster={cluster} />
        </Grid>
      </StackItem>
      <StackItem>
        <Alerts />
      </StackItem>
      <StackItem>
        <ClusterToolbar>
          {canAddHosts && (
            <ToolbarButton
              variant={ButtonVariant.primary}
              id={getClusterDetailId('button-add-hosts')}
              onClick={onAddHosts}
            >
              Add hosts
            </ToolbarButton>
          )}
          {!isSingleClusterFeatureEnabled && (
            <ToolbarButton
              variant={ButtonVariant.link}
              onClick={() => void navigate('..')}
              id={getClusterDetailId('button-back-to-all-clusters')}
            >
              Back to all clusters
            </ToolbarButton>
          )}
        </ClusterToolbar>
      </StackItem>
    </Stack>
  );
};
