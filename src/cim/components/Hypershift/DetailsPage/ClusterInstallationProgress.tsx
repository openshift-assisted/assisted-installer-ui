import {
  ExpandableSectionToggle,
  Flex,
  FlexItem,
  Grid,
  GridItem,
  ProgressStep,
  ProgressStepper,
  Spinner,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import {
  global_palette_green_500 as okColor,
  global_danger_color_100 as dangerColor,
  global_warning_color_100 as warningColor,
} from '@patternfly/react-tokens';
import { CheckCircleIcon, ExclamationCircleIcon, UnknownIcon } from '@patternfly/react-icons';
import * as React from 'react';
import { AgentK8sResource, ClusterImageSetK8sResource, SecretK8sResource } from '../../../types';
import { getAgentStatus } from '../../helpers';
import { HostedClusterK8sResource, NodePoolK8sResource } from '../types';
import HypershiftKubeconfigDownload from './HypershiftKubeconfigDownload';
import NodePoolsTable from './NodePoolsTable';

import './ClusterInstallationProgress.css';
import { getNodepoolAgents } from '../utils';
import { HostStatusDef } from '../../../../common';

type ClusterInstallationProgressProps = {
  agents: AgentK8sResource[];
  hostedCluster: HostedClusterK8sResource;
  fetchSecret: (name: string, namespace: string) => Promise<SecretK8sResource>;

  nodePools: NodePoolK8sResource[];
  onRemoveNodePool: (nodePool: NodePoolK8sResource) => Promise<unknown>;
  onUpdateNodePool: (nodePool: NodePoolK8sResource, agents: AgentK8sResource[]) => Promise<void>;
  onAddNodePool: (
    nodePool: NodePoolK8sResource,
    selectedAgents: AgentK8sResource[],
    matchLabels: { [key: string]: string },
  ) => Promise<void>;
  clusterImages: ClusterImageSetK8sResource[];
};

const ClusterInstallationProgress = ({
  agents,
  hostedCluster,
  fetchSecret,
  nodePools,
  ...rest
}: ClusterInstallationProgressProps) => {
  const [isCPExpanded, setCPExpanded] = React.useState(true);
  const [isCHExpanded, setCHExpanded] = React.useState(true);
  const hostedClusterAvailable =
    hostedCluster.status?.conditions?.find((c) => c.type === 'Available')?.status === 'True';
  const agentsStatuses = nodePools.reduce((acc, nodePool) => {
    acc.push(...getNodepoolAgents(nodePool, agents).map((a) => getAgentStatus(a).status));
    return acc;
  }, [] as HostStatusDef[]);

  let agentsIcon = <Spinner size="md" />;

  if (agentsStatuses.some(({ key }) => key === 'error')) {
    agentsIcon = <ExclamationCircleIcon color={dangerColor.value} />;
  } else if (
    agentsStatuses.some(({ key }) =>
      [
        'pending-for-input',
        'insufficient',
        'insufficient-unbound',
        'disconnected-unbound',
        'disconnected',
      ].includes(key),
    )
  ) {
    agentsIcon = <ExclamationCircleIcon color={warningColor.value} />;
  } else if (agentsStatuses.every(({ key }) => key === 'added-to-existing-cluster')) {
    agentsIcon = <CheckCircleIcon color={okColor.value} />;
  }
  return (
    <Stack hasGutter>
      <StackItem>
        <ProgressStepper isVertical>
          <ProgressStep
            icon={
              hostedClusterAvailable ? (
                <CheckCircleIcon color={okColor.value} />
              ) : (
                <Spinner size="md" />
              )
            }
          >
            <Stack hasGutter>
              <StackItem>
                <ExpandableSectionToggle
                  isExpanded={isCPExpanded}
                  onToggle={setCPExpanded}
                  className="ai-progress-item__header"
                >
                  Control plane
                </ExpandableSectionToggle>
              </StackItem>
              {isCPExpanded && (
                <StackItem className="ai-progress-item__body">
                  <Grid hasGutter>
                    <GridItem span={4}>
                      <b>Condition</b>
                    </GridItem>
                    <GridItem span={8}>
                      <b>Message</b>
                    </GridItem>
                    {hostedCluster.status?.conditions?.map((c) => {
                      let icon = <UnknownIcon />;
                      if (c.status === 'True') {
                        icon = <CheckCircleIcon color={okColor.value} />;
                      } else if (c.status === 'False') {
                        icon = <ExclamationCircleIcon color={dangerColor.value} size="sm" />;
                      }
                      return (
                        <React.Fragment key={c.type}>
                          <GridItem span={4}>
                            <Flex
                              alignItems={{ default: 'alignItemsCenter' }}
                              spaceItems={{ default: 'spaceItemsXs' }}
                            >
                              <FlexItem>{icon}</FlexItem>
                              <FlexItem>{c.type}</FlexItem>
                            </Flex>
                          </GridItem>
                          <GridItem span={8}>{c.message}</GridItem>
                        </React.Fragment>
                      );
                    })}
                  </Grid>
                </StackItem>
              )}
            </Stack>
          </ProgressStep>
          <ProgressStep icon={agentsIcon}>
            <Stack hasGutter>
              <StackItem>
                <ExpandableSectionToggle
                  isExpanded={isCHExpanded}
                  onToggle={setCHExpanded}
                  className="ai-progress-item__header"
                >
                  Cluster hosts
                </ExpandableSectionToggle>
              </StackItem>
              {isCHExpanded && (
                <StackItem className="ai-progress-item__body">
                  <NodePoolsTable
                    nodePools={nodePools}
                    agents={agents}
                    hostedCluster={hostedCluster}
                    {...rest}
                  />
                </StackItem>
              )}
            </Stack>
          </ProgressStep>
        </ProgressStepper>
      </StackItem>
      <StackItem>
        <HypershiftKubeconfigDownload hostedCluster={hostedCluster} fetchSecret={fetchSecret} />
      </StackItem>
    </Stack>
  );
};

export default ClusterInstallationProgress;
