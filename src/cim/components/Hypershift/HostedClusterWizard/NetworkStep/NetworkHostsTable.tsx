import { ConnectedIcon } from '@patternfly/react-icons';
import { sortable } from '@patternfly/react-table';
import { useFormikContext } from 'formik';
import * as React from 'react';
import { DASH, EmptyState, getInventory, getSubnet, Host } from '../../../../../common';
import { TableRow } from '../../../../../common/components/hosts/AITable';
import { HostDetail } from '../../../../../common/components/hosts/HostRowDetail';
import HostsTable from '../../../../../common/components/hosts/HostsTable';
import { getSelectedNic, hostnameColumn } from '../../../../../common/components/hosts/tableUtils';
import { usePagination } from '../../../../../common/components/hosts/usePagination';
import { AgentK8sResource } from '../../../../types';
import { useAgentsTable } from '../../../Agent/tableUtils';
import { getAgentsHostsNames } from '../../../ClusterDeployment';
import { AdditionalNTPSourcesDialogToggle } from '../../../ClusterDeployment/AdditionalNTPSourcesDialogToggle';
import { EditAgentModal } from '../../../modals';
import { NetworkFormValues, NetworkHostsTableProps } from './types';

type ExpandComponentProps = {
  obj: Host;
};

const ExpandComponent: React.FC<ExpandComponentProps> = ({ obj }) => (
  <HostDetail
    host={obj}
    AdditionalNTPSourcesDialogToggleComponent={AdditionalNTPSourcesDialogToggle}
  />
);

const activeNICColumn = (machineNetworkCidr: string): TableRow<Host> => ({
  header: { title: 'Active NIC', transforms: [sortable] },
  cell: (host) => {
    const inventory = getInventory(host);
    const nics = inventory.interfaces || [];
    const currentSubnet = machineNetworkCidr ? getSubnet(machineNetworkCidr) : null;
    const selectedNic = currentSubnet ? getSelectedNic(nics, currentSubnet) : null;
    return {
      title: selectedNic?.name || DASH,
      props: { 'data-testid': 'nic-name' },
      sortableValue: selectedNic?.name || DASH,
    };
  },
});

const NetworkHostsTable: React.FC<NetworkHostsTableProps> = ({ agents, onEditHostname }) => {
  const [editAgent, setEditAgent] = React.useState<AgentK8sResource>();
  const { values } = useFormikContext<NetworkFormValues>();
  const [hosts, tableActions, actionsResolver] = useAgentsTable(
    { agents },
    { onEditHost: setEditAgent },
  );

  const content = React.useMemo(
    () => [hostnameColumn(tableActions.onEditHost, hosts), activeNICColumn(values.machineCIDR)],
    [hosts, values.machineCIDR, tableActions],
  );

  const paginationProps = usePagination(hosts.length);

  return (
    <>
      <HostsTable
        testId="networking-host-table"
        hosts={hosts}
        ExpandComponent={ExpandComponent}
        content={content}
        actionResolver={actionsResolver}
        {...paginationProps}
      >
        <EmptyState
          icon={ConnectedIcon}
          title="Waiting for hosts..."
          content="Hosts may take a few minutes to appear here after booting."
        />
      </HostsTable>
      {editAgent && (
        <EditAgentModal
          isOpen
          agent={editAgent}
          usedHostnames={getAgentsHostsNames(agents)}
          onClose={() => setEditAgent(undefined)}
          onSave={onEditHostname}
        />
      )}
    </>
  );
};

export default NetworkHostsTable;
