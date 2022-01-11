import * as React from 'react';
import { DropdownItem } from '@patternfly/react-core';
import { noop } from 'lodash';

import { Host } from '../../../common/api/types';
import {
  discoveryTypeColumn,
  infraEnvStatusColumn,
  clusterColumn,
  useAgentsTable,
} from '../Agent/tableUtils';
import HostsTable, {
  DefaultExpandComponent,
  HostsTableEmptyState,
} from '../../../common/components/hosts/HostsTable';
import {
  cpuCoresColumn,
  discoveredAtColumn,
  disksColumn,
  hostnameColumn,
  memoryColumn,
} from '../../../common/components/hosts/tableUtils';
import {
  DiscoveryTroubleshootingModal,
  HostToolbar,
  ChangeHostnameAction,
  MassChangeHostnameModal,
} from '../../../common';
import { TableRow } from '../../../common/components/hosts/AITable';
import { InfraEnvAgentTableProps } from '../ClusterDeployment/types';
import MassApproveAgentModal from '../modals/MassApproveAgentModal';
import { ActionItemsContext } from '../../../common/components/hosts/HostToolbar';

type MassApproveActionProps = {
  onApprove: VoidFunction;
};

const MassApproveAction: React.FC<MassApproveActionProps> = ({ onApprove }) => {
  const isDisabled = React.useContext(ActionItemsContext);
  return (
    <DropdownItem
      onClick={onApprove}
      isDisabled={isDisabled}
      description={isDisabled ? 'Select one or more hosts to approve' : undefined}
    >
      Approve
    </DropdownItem>
  );
};

const InfraEnvAgentTable: React.FC<InfraEnvAgentTableProps> = ({
  agents,
  className,
  getClusterDeploymentLink,
  bareMetalHosts,
  infraEnv,
  hideClusterColumn,
  onApprove,
  onChangeHostname,
  onChangeBMHHostname,
  ...actions
}) => {
  const [isDiscoveryHintModalOpen, setDiscoveryHintModalOpen] = React.useState(false);
  const [isMassChangeHostOpen, setMassChangeHostOpen] = React.useState(false);
  const [isMassApproveOpen, setMassApproveOpen] = React.useState(false);
  const [selectedHostIDs, setSelectedHostIDs] = React.useState<string[]>([]);
  const onSelect = (host: Host, isSelected: boolean) => {
    if (isSelected) {
      setSelectedHostIDs([...selectedHostIDs, host.id]);
    } else {
      setSelectedHostIDs(selectedHostIDs.filter((sa) => sa !== host.id));
    }
  };

  const [hosts, hostActions, actionResolver] = useAgentsTable(actions, {
    agents,
    bmhs: bareMetalHosts,
    infraEnv,
  });
  const content = React.useMemo(
    () =>
      [
        hostnameColumn(hostActions.onEditHost),
        discoveryTypeColumn(agents, bareMetalHosts),
        infraEnvStatusColumn({
          agents,
          bareMetalHosts,
          onEditHostname: actions.onEditHost,
          onApprove: actions.onApprove,
        }),
        (!hideClusterColumn && clusterColumn(agents, getClusterDeploymentLink)) as TableRow<Host>,
        discoveredAtColumn,
        cpuCoresColumn,
        memoryColumn,
        disksColumn,
      ].filter(Boolean),
    [agents, actions, getClusterDeploymentLink, hostActions, bareMetalHosts, hideClusterColumn],
  );

  const hostIDs = hosts.map((h) => h.id);
  return (
    <>
      <HostToolbar
        hostIDs={hostIDs}
        selectedHostIDs={selectedHostIDs}
        onSelectNone={() => setSelectedHostIDs([])}
        onSelectAll={() => setSelectedHostIDs(hostIDs)}
        actionItems={[
          <ChangeHostnameAction
            key="hostname"
            onChangeHostname={() => setMassChangeHostOpen(!isMassChangeHostOpen)}
          />,
          <MassApproveAction
            key="approve"
            onApprove={() => setMassApproveOpen(!isMassApproveOpen)}
          />,
        ]}
      />
      <HostsTable
        hosts={hosts}
        content={content}
        actionResolver={actionResolver}
        className={className}
        selectedIDs={selectedHostIDs}
        setSelectedHostIDs={setSelectedHostIDs}
        onSelect={onSelect}
        ExpandComponent={DefaultExpandComponent}
      >
        <HostsTableEmptyState setDiscoveryHintModalOpen={setDiscoveryHintModalOpen} />
      </HostsTable>
      <DiscoveryTroubleshootingModal
        isOpen={isDiscoveryHintModalOpen}
        setDiscoveryHintModalOpen={setDiscoveryHintModalOpen}
      />
      <MassChangeHostnameModal
        isOpen={isMassChangeHostOpen}
        hosts={hosts}
        selectedHostIDs={selectedHostIDs}
        onChangeHostname={async (host, hostname) => {
          const agent = agents.find((a) => a.metadata?.uid === host.id);
          if (agent) {
            return onChangeHostname(agent, hostname);
          } else {
            const bmh = bareMetalHosts.find((bmh) => bmh.metadata?.uid === host.id);
            return bmh ? onChangeBMHHostname(bmh, hostname) : noop;
          }
        }}
        onClose={() => setMassChangeHostOpen(false)}
      />
      <MassApproveAgentModal
        isOpen={isMassApproveOpen}
        agents={agents.filter((a) => selectedHostIDs.includes(a.metadata?.uid || ''))}
        onApprove={onApprove}
        onClose={() => setMassApproveOpen(false)}
      />
    </>
  );
};

export default InfraEnvAgentTable;
