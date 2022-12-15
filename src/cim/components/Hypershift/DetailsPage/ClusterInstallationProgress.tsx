import * as React from 'react';
import { ProgressStepper, Stack, StackItem } from '@patternfly/react-core';
import { AgentK8sResource, ConfigMapK8sResource, SecretK8sResource } from '../../../types';
import { AgentMachineK8sResource, HostedClusterK8sResource, NodePoolK8sResource } from '../types';
import HypershiftKubeconfigDownload from './HypershiftKubeconfigDownload';
import HostedClusterProgress from './HostedClusterProgress';
import NodePoolsProgress from './NodePoolsProgress';

import './ClusterInstallationProgress.css';

type ClusterInstallationProgressProps = {
  agents: AgentK8sResource[];
  agentMachines: AgentMachineK8sResource[];
  hostedCluster: HostedClusterK8sResource;
  fetchSecret: (name: string, namespace: string) => Promise<SecretK8sResource>;
  nodePools: NodePoolK8sResource[];
  onRemoveNodePool: (nodePool: NodePoolK8sResource) => Promise<unknown>;
  onUpdateNodePool: (
    nodePool: NodePoolK8sResource,
    nodePoolPatches: {
      op: string;
      value: unknown;
      path: string;
    }[],
  ) => Promise<unknown>;
  onAddNodePool: (nodePool: NodePoolK8sResource) => Promise<unknown>;
  launchToOCP: (urlSuffix: string, newTab: boolean) => void;
  supportedVersionsCM?: ConfigMapK8sResource;
};

const ClusterInstallationProgress = ({
  hostedCluster,
  fetchSecret,
  launchToOCP,
  ...rest
}: ClusterInstallationProgressProps) => (
  <Stack hasGutter>
    <StackItem>
      <ProgressStepper isVertical>
        <HostedClusterProgress hostedCluster={hostedCluster} launchToOCP={launchToOCP} />
        <NodePoolsProgress hostedCluster={hostedCluster} {...rest} />
      </ProgressStepper>
    </StackItem>
    <StackItem>
      <HypershiftKubeconfigDownload hostedCluster={hostedCluster} fetchSecret={fetchSecret} />
    </StackItem>
  </Stack>
);

export default ClusterInstallationProgress;
