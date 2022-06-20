import { Button, Label, Stack, StackItem } from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';
import {
  breakWord,
  expandable,
  sortable,
  TableComposable,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@patternfly/react-table';
import * as React from 'react';
import { TableRow } from '../../../../common/components/hosts/AITable';
import { getHostRowHardwareInfo } from '../../../../common/components/hosts/hardwareInfo';
import { AgentK8sResource, ClusterImageSetK8sResource } from '../../../types';
import AgentStatus from '../../Agent/AgentStatus';
import { INFRAENV_AGENTINSTALL_LABEL_KEY } from '../../common';
import ManageHostsModal from '../modals/ManageHostsModal';
import AddNodePoolModal from '../modals/AddNodePoolModal';
import { HostedClusterK8sResource, NodePoolK8sResource } from '../types';
import { Link } from 'react-router-dom';
import RemoveNodePoolModal from '../modals/RemoveNodePoolModal';
import { getNodepoolAgents } from '../utils';

type NodePoolsTableProps = {
  nodePools: NodePoolK8sResource[];
  agents: AgentK8sResource[];
  onRemoveNodePool: (nodePool: NodePoolK8sResource) => Promise<unknown>;
  onUpdateNodePool: (nodePool: NodePoolK8sResource, agents: AgentK8sResource[]) => Promise<void>;
  hostedCluster: HostedClusterK8sResource;
  onAddNodePool: (
    nodePool: NodePoolK8sResource,
    selectedAgents: AgentK8sResource[],
    matchLabels: { [key: string]: string },
  ) => Promise<void>;
  clusterImages: ClusterImageSetK8sResource[];
};

type NodePoolWithAgents = {
  nodePool: NodePoolK8sResource;
  agents: AgentK8sResource[];
};

export const nodePoolNameColumn = (): TableRow<NodePoolWithAgents> => {
  return {
    header: {
      title: 'Nodepool',
      props: {
        id: 'col-header-hostname', // ACM jest tests require id over testId
      },
      transforms: [sortable],
      cellFormatters: [expandable],
      cellTransforms: [breakWord],
    },
    cell: ({ nodePool }) => {
      return {
        title: nodePool.metadata?.name,
        props: { 'data-testid': 'nodepool-name' },
        sortableValue: nodePool.metadata?.name,
      };
    },
  };
};

const NodePoolsTable = ({
  nodePools,
  agents,
  onRemoveNodePool,
  onUpdateNodePool,
  hostedCluster,
  onAddNodePool,
  clusterImages,
}: NodePoolsTableProps): JSX.Element => {
  const [manageHostsOpen, setManageHostsOpen] = React.useState<string>();
  const [addNodePool, setAddNodePool] = React.useState(false);
  const [removeNodePoolOpen, setRemoveNodePoolOpen] = React.useState<string>();
  const [expandedNodePools, setExpandedNodePools] = React.useState<string[]>([]);

  const manageNodePool = nodePools.find((np) => np.metadata?.uid === manageHostsOpen);
  const removeNodePool = nodePools.find((np) => np.metadata?.uid === removeNodePoolOpen);

  return (
    <>
      <Stack hasGutter>
        <StackItem>
          <TableComposable variant="compact">
            <Thead>
              <Tr>
                <Th />
                <Th>Nodepool</Th>
                <Th>Hostname</Th>
                <Th>Status</Th>
                <Th>Infrastructure env</Th>
                <Th>CPU cores</Th>
                <Th>Memory</Th>
                <Th>Total storage</Th>
                <Th />
              </Tr>
            </Thead>
            <Tbody>
              {...nodePools.reduce((rows, np) => {
                const nodePoolAgents = getNodepoolAgents(np, agents);
                const isExpanded = expandedNodePools.some((uid) => uid === np.metadata?.uid);
                rows.push(
                  <Tr key={np.metadata?.uid}>
                    <Td
                      expand={{
                        isExpanded,
                        rowIndex: 0,
                        onToggle: () =>
                          isExpanded
                            ? setExpandedNodePools(
                                expandedNodePools.filter((uid) => uid !== np.metadata?.uid),
                              )
                            : setExpandedNodePools([...expandedNodePools, np.metadata?.uid || '']),
                      }}
                    />
                    <Td>{np.metadata?.name}</Td>
                    <Td>
                      <Label variant="outline">{`${nodePoolAgents.length} hosts`}</Label>
                    </Td>
                    <Td>-</Td>
                    <Td>-</Td>
                    <Td>-</Td>
                    <Td>-</Td>
                    <Td>-</Td>
                    <Td
                      actions={{
                        items: [
                          {
                            title: 'Manage hosts',
                            onClick: () => setManageHostsOpen(np.metadata?.uid),
                          },
                          {
                            title: 'Remove Nodepool',
                            onClick: () => setRemoveNodePoolOpen(np.metadata?.uid),
                          },
                        ],
                      }}
                    />
                  </Tr>,
                );
                if (expandedNodePools.find((uid) => uid === np.metadata?.uid)) {
                  nodePoolAgents.forEach((agent) => {
                    const { memory, cores, disk } = getHostRowHardwareInfo(
                      agent.status?.inventory || {},
                    );
                    rows.push(
                      <Tr key={agent.metadata?.uid}>
                        <Td />
                        <Td />
                        <Td>{agent.spec.hostname || agent.status?.inventory.hostname}</Td>
                        <Td>
                          <AgentStatus agent={agent} />
                        </Td>
                        <Td>
                          <Link
                            to={`/multicloud/infrastructure/environments/details/${
                              agent.metadata?.namespace || ''
                            }/${agent.metadata?.labels?.[INFRAENV_AGENTINSTALL_LABEL_KEY] || ''}`}
                          >
                            {agent.metadata?.labels?.[INFRAENV_AGENTINSTALL_LABEL_KEY]}
                          </Link>
                        </Td>
                        <Td>{cores.title}</Td>
                        <Td>{memory.title}</Td>
                        <Td>{disk.title}</Td>
                      </Tr>,
                    );
                  });
                }
                return rows;
              }, [] as JSX.Element[])}
            </Tbody>
          </TableComposable>
        </StackItem>
        <StackItem>
          <Button
            variant="link"
            icon={<PlusCircleIcon />}
            iconPosition="right"
            onClick={() => setAddNodePool(true)}
          >
            Add Nodepool
          </Button>
        </StackItem>
      </Stack>
      {manageNodePool && (
        <ManageHostsModal
          hostedCluster={hostedCluster}
          agents={agents}
          nodePool={manageNodePool}
          onClose={() => setManageHostsOpen(undefined)}
          onSubmit={(agents) => onUpdateNodePool(manageNodePool, agents)}
        />
      )}
      {addNodePool && (
        <AddNodePoolModal
          onClose={() => setAddNodePool(false)}
          // eslint-disable-next-line
          onSubmit={onAddNodePool}
          agentsNamespace={hostedCluster.spec.platform.agent?.agentNamespace || ''}
          agents={agents}
          hostedCluster={hostedCluster}
          clusterImages={clusterImages}
        />
      )}
      {removeNodePool && (
        <RemoveNodePoolModal
          onClose={() => setRemoveNodePoolOpen(undefined)}
          onRemove={onRemoveNodePool}
          nodePool={removeNodePool}
        />
      )}
    </>
  );
};

export default NodePoolsTable;
