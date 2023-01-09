import * as React from 'react';
import { Link } from 'react-router-dom';
import { Button, Label, Popover, Stack, StackItem } from '@patternfly/react-core';
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
import classnames from 'classnames';

import { TableRow } from '../../../../common/components/hosts/AITable';
import { getHostRowHardwareInfo } from '../../../../common/components/hosts/hardwareInfo';
import { AgentK8sResource, ConfigMapK8sResource } from '../../../types';
import AgentStatus from '../../Agent/AgentStatus';
import { INFRAENV_AGENTINSTALL_LABEL_KEY } from '../../common';
import ManageHostsModal from '../modals/ManageHostsModal';
import AddNodePoolModal from '../modals/AddNodePoolModal';
import { AgentMachineK8sResource, HostedClusterK8sResource, NodePoolK8sResource } from '../types';
import RemoveNodePoolModal from '../modals/RemoveNodePoolModal';
import NodePoolStatus from './NodePoolStatus';
import { fileSize } from '../../../../common';
import { useTranslation } from '../../../../common/hooks/use-translation-wrapper';
import { getNodepoolAgents } from '../utils';

import './NodePoolsTable.css';

type NodePoolsTableProps = {
  nodePools: NodePoolK8sResource[];
  agents: AgentK8sResource[];
  onRemoveNodePool: (nodePool: NodePoolK8sResource) => Promise<unknown>;
  onUpdateNodePool: (
    nodePool: NodePoolK8sResource,
    nodePoolPatches: {
      op: string;
      value: unknown;
      path: string;
    }[],
  ) => Promise<unknown>;
  hostedCluster: HostedClusterK8sResource;
  onAddNodePool: (nodePool: NodePoolK8sResource) => Promise<unknown>;
  agentMachines: AgentMachineK8sResource[];
  supportedVersionsCM?: ConfigMapK8sResource;
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
  agentMachines,
  supportedVersionsCM,
}: NodePoolsTableProps): JSX.Element => {
  const { t } = useTranslation();
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
                <Th>{t('ai:Nodepool')}</Th>
                <Th>{t('ai:Hostname')}</Th>
                <Th>{t('ai:Status')}</Th>
                <Th>{t('ai:Infrastructure env')}</Th>
                <Th>{t('ai:CPU cores')}</Th>
                <Th>{t('ai:Memory')}</Th>
                <Th>{t('ai:Total storage')}</Th>
                <Th />
              </Tr>
            </Thead>
            <Tbody>
              {...nodePools.reduce<JSX.Element[]>((rows, np) => {
                const nodePoolAgents = getNodepoolAgents(np, agents, agentMachines, hostedCluster);
                const isExpanded = expandedNodePools.some((uid) => uid === np.metadata?.uid);

                const totals = nodePoolAgents.reduce(
                  (acc, agent) => {
                    const { memory, cores, disk } = getHostRowHardwareInfo(
                      agent.status?.inventory || {},
                    );
                    acc.memory += +memory.sortableValue;
                    acc.cores += +cores.sortableValue;
                    acc.disk += +disk.sortableValue;
                    return acc;
                  },
                  { memory: 0, cores: 0, disk: 0 },
                );

                rows.push(
                  <Tr
                    key={np.metadata?.uid}
                    className={isExpanded ? 'ai-nodepools-table__no-border' : undefined}
                  >
                    <Td
                      expand={
                        nodePoolAgents.length
                          ? {
                              isExpanded,
                              rowIndex: 0,
                              onToggle: () =>
                                isExpanded
                                  ? setExpandedNodePools(
                                      expandedNodePools.filter((uid) => uid !== np.metadata?.uid),
                                    )
                                  : setExpandedNodePools([
                                      ...expandedNodePools,
                                      np.metadata?.uid || '',
                                    ]),
                            }
                          : undefined
                      }
                    />
                    <Td>{np.metadata?.name}</Td>
                    <Td>
                      <Popover
                        aria-label="node pool hosts"
                        hasAutoWidth
                        bodyContent={t('ai:{{agents}} of {{count}} host requested is available', {
                          agents: nodePoolAgents.length,
                          count: np.spec.replicas,
                        })}
                      >
                        <Label variant="outline">
                          {t('ai:{{count}} host requested', { count: np.spec.replicas })}
                        </Label>
                      </Popover>
                    </Td>
                    <Td>
                      <NodePoolStatus nodePool={np} agents={nodePoolAgents} />
                    </Td>
                    <Td>-</Td>
                    <Td>{nodePoolAgents.length ? totals.cores : '-'}</Td>
                    <Td>{nodePoolAgents.length ? fileSize(totals.memory, 2, 'iec') : '-'}</Td>
                    <Td>{nodePoolAgents.length ? fileSize(totals.disk, 2, 'si') : '-'}</Td>
                    <Td
                      actions={{
                        items: [
                          {
                            title: t('ai:Manage hosts'),
                            onClick: () => setManageHostsOpen(np.metadata?.uid),
                          },
                          {
                            title: t('ai:Remove Nodepool'),
                            onClick: () => setRemoveNodePoolOpen(np.metadata?.uid),
                          },
                        ],
                      }}
                    />
                  </Tr>,
                );
                if (expandedNodePools.find((uid) => uid === np.metadata?.uid)) {
                  nodePoolAgents.forEach((agent, index) => {
                    const { memory, cores, disk } = getHostRowHardwareInfo(
                      agent.status?.inventory || {},
                    );
                    rows.push(
                      <Tr
                        key={agent.metadata?.uid}
                        className={classnames({
                          'ai-nodepools-table__no-border': index < nodePoolAgents.length - 1,
                        })}
                      >
                        <Td />
                        <Td />
                        <Td>{agent.spec.hostname || agent.status?.inventory.hostname}</Td>
                        <Td>
                          <AgentStatus agent={agent} isDay2 />
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
              }, [])}
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
            {t('ai:Add Nodepool')}
          </Button>
        </StackItem>
      </Stack>
      {manageNodePool && (
        <ManageHostsModal
          hostedCluster={hostedCluster}
          agents={agents}
          nodePool={manageNodePool}
          onClose={() => setManageHostsOpen(undefined)}
          onSubmit={onUpdateNodePool}
          agentMachines={agentMachines}
        />
      )}
      {addNodePool && (
        <AddNodePoolModal
          onClose={() => setAddNodePool(false)}
          onSubmit={onAddNodePool}
          agentsNamespace={hostedCluster.spec.platform.agent?.agentNamespace || ''}
          agents={agents}
          hostedCluster={hostedCluster}
          supportedVersionsCM={supportedVersionsCM}
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
