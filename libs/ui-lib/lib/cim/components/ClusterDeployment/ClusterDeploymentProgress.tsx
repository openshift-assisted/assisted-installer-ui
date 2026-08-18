import React from 'react';
import { Stack, StackItem } from '@patternfly/react-core';
import { ClusterProgress, EventListFetchProps, ClusterProgressItems } from '../../../common';
import {
  AgentK8sResource,
  AgentClusterInstallK8sResource,
  ClusterDeploymentK8sResource,
} from '../../types';
import { getAICluster } from '../helpers/toAssisted';

type ClusterDeploymentProgressProps = {
  clusterDeployment: ClusterDeploymentK8sResource;
  agentClusterInstall: AgentClusterInstallK8sResource;
  agents: AgentK8sResource[];
  onFetchEvents: EventListFetchProps['onFetchEvents'];
  fallbackEventsURL?: string;
};

const ClusterDeploymentProgress = ({
  clusterDeployment,
  agentClusterInstall,
  agents,
  onFetchEvents,
  fallbackEventsURL,
}: ClusterDeploymentProgressProps) => {
  const cluster = getAICluster({ clusterDeployment, agentClusterInstall, agents });
  return (
    <Stack hasGutter>
      <StackItem>
        <ClusterProgress
          totalPercentage={agentClusterInstall.status?.progress?.totalPercentage || 0}
          cluster={cluster}
        />
      </StackItem>
      <StackItem>
        <ClusterProgressItems
          cluster={cluster}
          onFetchEvents={onFetchEvents}
          fallbackEventsURL={fallbackEventsURL}
        />
      </StackItem>
    </Stack>
  );
};

export default ClusterDeploymentProgress;
