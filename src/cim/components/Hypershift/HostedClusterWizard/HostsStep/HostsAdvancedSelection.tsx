import { useFormikContext } from 'formik';
import * as React from 'react';
import HostsTable, {
  DefaultExpandComponent,
} from '../../../../../common/components/hosts/HostsTable';
import {
  cpuCoresColumn,
  disksColumn,
  hostnameColumn,
  memoryColumn,
} from '../../../../../common/components/hosts/tableUtils';
import { usePagination } from '../../../../../common/components/hosts/usePagination';
import { AgentK8sResource } from '../../../../types';
import { useAgentsTable } from '../../../Agent/tableUtils';
import { HostsFormValues } from './types';
import DefaultEmptyState from '../../../../../common/components/ui/uiState/EmptyState';
import { useFormikHelpers } from '../../../../../common/hooks/useFormikHelpers';
import { useTranslation } from '../../../../../common/hooks/use-translation-wrapper';

type HostsAdvancedSelectionProps = {
  agents: AgentK8sResource[];
  infraEnvAgents: AgentK8sResource[];
  index: number;
};

const HostsAdvancedSelection: React.FC<HostsAdvancedSelectionProps> = ({
  agents,
  infraEnvAgents,
  index,
}) => {
  const { values } = useFormikContext<HostsFormValues>();

  const { setValue: setNodePoolsValue } =
    useFormikHelpers<HostsFormValues['nodePools']>('nodePools');

  const nodePoolsRef = React.useRef(values.nodePools);
  nodePoolsRef.current = values.nodePools;

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
    [setNodePoolsValue, index],
  );

  const setSelectedIDs = React.useCallback(
    (ids: string[]) => {
      const newNodePools = [...nodePoolsRef.current];
      newNodePools[index].selectedAgentIDs = ids;
      void setNodePoolsValue(newNodePools);
    },
    [setNodePoolsValue, index],
  );

  const [hosts, actions] = useAgentsTable({ agents }, { onSelect });
  const { t } = useTranslation();
  const content = React.useMemo(
    () => [hostnameColumn(t, undefined, hosts), cpuCoresColumn, memoryColumn, disksColumn],
    [hosts],
  );

  const paginationProps = usePagination(hosts.length);

  return (
    <HostsTable
      hosts={hosts}
      content={content}
      selectedIDs={values.nodePools[index].selectedAgentIDs}
      ExpandComponent={DefaultExpandComponent}
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
