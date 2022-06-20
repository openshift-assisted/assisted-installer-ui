import * as React from 'react';
import { AgentK8sResource } from '../../../../types';
import { HostsFormValues } from './types';
import { useFormikHelpers } from '../../../../../common/hooks/useFormikHelpers';
import { useTranslation } from '../../../../../common/hooks/use-translation-wrapper';
import HostsSelectionTable from '../../HostsSelectionTable/HostsSelectionTable';

type HostsAdvancedSelectionProps = {
  agents: AgentK8sResource[];
  index: number;
};

const HostsAdvancedSelection: React.FC<HostsAdvancedSelectionProps> = ({ agents, index }) => {
  const { setValue: setNodePoolsValue, valueRef: nodePoolsRef } =
    useFormikHelpers<HostsFormValues['nodePools']>('nodePools');

  const onSelect = React.useCallback(
    (agent: AgentK8sResource, selected: boolean) => {
      const newIDs = selected
        ? [...nodePoolsRef.current[index].selectedAgentIDs, agent.metadata?.uid || '']
        : nodePoolsRef.current[index].selectedAgentIDs.filter(
            (uid: string) => uid !== agent.metadata?.uid,
          );
      const newNodePools = [...nodePoolsRef.current];
      newNodePools[index].selectedAgentIDs = newIDs;
      void setNodePoolsValue(newNodePools);
    },
    [setNodePoolsValue, index, nodePoolsRef],
  );

  const setSelectedIDs = React.useCallback(
    (ids: string[]) => {
      const newNodePools = [...nodePoolsRef.current];
      newNodePools[index].selectedAgentIDs = ids;
      void setNodePoolsValue(newNodePools);
    },
    [setNodePoolsValue, index, nodePoolsRef],
  );

  const [hosts, actions] = useAgentsTable({ agents }, { onSelect });
  const { t } = useTranslation();
  const content = React.useMemo(
    () => [hostnameColumn(t, undefined, hosts), cpuCoresColumn, memoryColumn, disksColumn],
    [hosts],
  );

  const paginationProps = usePagination(hosts.length);

  return (
    <HostsSelectionTable
      agents={agents}
      onSelect={onSelect}
      selectedIDs={nodePoolsRef.current[index].selectedAgentIDs}
      setSelectedIDs={setSelectedIDs}
      canSelectAll
      {...actions}
      {...paginationProps}
    >
      <DefaultEmptyState
        title={t('ai:No hosts found')}
        content={
          !infraEnvAgents.length
            ? t('ai:There are no available hosts in the selected infra environment')
            : t('ai:No host matches provided labels')
        }
      />
    </HostsTable>
  );
};

export default HostsAdvancedSelection;
