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
  Alerts,
  getEnabledHosts,
  selectOlmOperators,
  isSNO,
  useFeature,
} from '../../../common';
import { Cluster } from '../../../common/api/types';
import ClusterToolbar from '../clusters/ClusterToolbar';
import { getClusterDetailId } from './utils';
import { routeBasePath } from '../../config';
import ClusterDetailStatusVarieties, {
  useClusterStatusVarieties,
} from './ClusterDetailStatusVarieties';
import ClusterProgress from '../../../common/components/clusterDetail/ClusterProgress';
import { onFetchEvents } from '../fetching/fetchEvents';
import { getClusterProgressAlerts } from './getProgressBarAlerts';
import { ClustersAPI } from '../../services/apis';
import { updateCluster } from '../../reducers/clusters';
import { handleApiError, ocmClient } from '../../api';
import { useNewFeatureSupportLevel } from '../../../common/components/newFeatureSupportLevels';
import OcmClusterProgressItems from '../clusterConfiguration/OcmClusterProgressItems';
import ClusterDetailsButtonGroup from './ClusterDetailsButtonGroup';
import ClusterSummaryExpandable from './ClusterSummaryExpandable';
import HostInventoryExpandable from './HostInventoryExpandable';

type ClusterDetailProps = {
  cluster: Cluster;
};

const ClusterDetail: React.FC<ClusterDetailProps> = ({ cluster }) => {
  const clusterVarieties = useClusterStatusVarieties(cluster);
  const featureSupportLevelContext = useNewFeatureSupportLevel();
  const isSNOExpansionAllowed =
    featureSupportLevelContext.isFeatureSupported('SINGLE_NODE_EXPANSION');
  const isSingleClusterFeatureEnabled = useFeature('ASSISTED_INSTALLER_SINGLE_CLUSTER_FEATURE');

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
            <OcmClusterProgressItems cluster={cluster} onFetchEvents={onFetchEvents} />
          </GridItem>
          <GridItem span={6}>
            {getClusterProgressAlerts(
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
              component={(props) => (
                <Link to={`${routeBasePath}/clusters/${cluster.id}`} {...props} />
              )}
              id={getClusterDetailId('button-add-hosts')}
              onClick={onAddHosts}
            >
              Add hosts
            </ToolbarButton>
          )}
          {!isSingleClusterFeatureEnabled && (
            <ToolbarButton
              variant={ButtonVariant.link}
              component={(props) => <Link to={`${routeBasePath}/clusters`} {...props} />}
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

export default ClusterDetail;
