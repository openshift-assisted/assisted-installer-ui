import * as React from 'react';
import {
  ExpandableSectionToggle,
  ProgressStep,
  Spinner,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { TFunction } from 'i18next';
import { t_global_color_status_success_default as okColor } from '@patternfly/react-tokens/dist/js/t_global_color_status_success_default';
import { CheckCircleIcon } from '@patternfly/react-icons/dist/js/icons/check-circle-icon';

import {
  AgentMachineK8sResource,
  HostedClusterK8sResource,
  NodePoolK8sResource,
  NodePoolPatches,
} from '../types';
import { AgentK8sResource, ConfigMapK8sResource } from '../../../types';
import { getNodepoolAgents, getNodePoolStatus, NodePoolStatus } from '../utils';
import { useTranslation } from '../../../../common/hooks/use-translation-wrapper';
import NodePoolsTable from './NodePoolsTable';

const getNodePoolsStatus = (
  agentMachines: AgentMachineK8sResource[],
  hostedCluster: HostedClusterK8sResource,
  nodePools: NodePoolK8sResource[],
  agents: AgentK8sResource[],
  t: TFunction,
): React.ReactNode => {
  const nodePoolMap = nodePools.reduce<{
    [key: string]: { agents: AgentK8sResource[]; status: NodePoolStatus };
  }>((acc, np) => {
    const nodePoolAgents = getNodepoolAgents(np, agents, agentMachines, hostedCluster);
    const status = getNodePoolStatus(np, nodePoolAgents, t);
    acc[np.metadata?.uid || ''] = {
      agents: nodePoolAgents,
      status,
    };
    return acc;
  }, {});

  const nodePoolsStatus: { type: string; icon: React.ReactNode } = {
    type: 'ok',
    icon: <CheckCircleIcon color={okColor.value} />,
  };

  for (const property in nodePoolMap) {
    const { status } = nodePoolMap[property];
    if (status.type === 'error') {
      nodePoolsStatus.type = 'error';
      nodePoolsStatus.icon = status.icon;
      break;
    }
    if (status.type === 'warning') {
      nodePoolsStatus.type = 'warning';
      nodePoolsStatus.icon = status.icon;
    }
    if (status.type === 'pending' && nodePoolsStatus.type !== 'warning') {
      nodePoolsStatus.type = 'pending';
      nodePoolsStatus.icon = <Spinner size="md" />;
    }
  }
  return nodePoolsStatus.icon;
};

type NodePoolsProgressProps = {
  agents: AgentK8sResource[];
  nodePools: NodePoolK8sResource[];
  agentMachines: AgentMachineK8sResource[];
  hostedCluster: HostedClusterK8sResource;
  onRemoveNodePool: (nodePool: NodePoolK8sResource) => Promise<unknown>;
  onUpdateNodePool: (
    nodePool: NodePoolK8sResource,
    nodePoolPatches: NodePoolPatches,
  ) => Promise<unknown>;
  onAddNodePool: (nodePool: NodePoolK8sResource) => Promise<unknown>;
  supportedVersionsCM?: ConfigMapK8sResource;
};

const NodePoolsProgress = ({
  nodePools,
  agentMachines,
  hostedCluster,
  agents,
  ...rest
}: NodePoolsProgressProps) => {
  const { t } = useTranslation();
  const [isExpanded, setExpanded] = React.useState(true);

  return (
    <ProgressStep icon={getNodePoolsStatus(agentMachines, hostedCluster, nodePools, agents, t)}>
      <Stack hasGutter>
        <StackItem>
          <ExpandableSectionToggle
            isExpanded={isExpanded}
            onToggle={setExpanded}
            className="ai-progress-item__header"
          >
            {t('ai:Cluster nodepools')}
          </ExpandableSectionToggle>
        </StackItem>
        {isExpanded && (
          <StackItem className="ai-progress-item__body">
            <NodePoolsTable
              nodePools={nodePools}
              agents={agents}
              hostedCluster={hostedCluster}
              agentMachines={agentMachines}
              {...rest}
            />
          </StackItem>
        )}
      </Stack>
    </ProgressStep>
  );
};

export default NodePoolsProgress;
