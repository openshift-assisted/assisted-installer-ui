import * as React from 'react';
import HostsTable, { DefaultExpandComponent } from '../../../../common/components/hosts/HostsTable';
import {
  cpuCoresColumn,
  disksColumn,
  hostnameColumn,
  memoryColumn,
} from '../../../../common/components/hosts/tableUtils';
import { usePagination } from '../../../../common/components/hosts/usePagination';
import { AgentK8sResource } from '../../../types';
import { useAgentsTable } from '../../Agent/tableUtils';
import DefaultEmptyState from '../../../../common/components/ui/uiState/EmptyState';

type HostsSelectionTable = {
  agents: AgentK8sResource[];
  onSelect: (agent: AgentK8sResource, selected: boolean) => void;
  selectedIDs: string[];
  setSelectedIDs: (selectedIDs: string[]) => void;
};

const HostsSelectionTable: React.FC<HostsSelectionTable> = ({
  agents,
  setSelectedIDs,
  selectedIDs,
  onSelect,
}) => {
  const [hosts, actions] = useAgentsTable({ agents }, { onSelect });

  const content = React.useMemo(
    () => [hostnameColumn(undefined, hosts), cpuCoresColumn, memoryColumn, disksColumn],
    [hosts],
  );

  const paginationProps = usePagination(hosts.length);

  return (
    <HostsTable
      hosts={hosts}
      content={content}
      selectedIDs={selectedIDs}
      ExpandComponent={DefaultExpandComponent}
      setSelectedIDs={setSelectedIDs}
      canSelectAll
      {...actions}
      {...paginationProps}
    >
      <DefaultEmptyState
        title="No hosts found"
        content="There are no available hosts in the selected infra environment"
      />
    </HostsTable>
  );
};

export default HostsSelectionTable;
