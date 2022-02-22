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
  DeleteHostAction,
} from '../../../common';
import { TableRow } from '../../../common/components/hosts/AITable';
import { InfraEnvAgentTableProps } from '../ClusterDeployment/types';
import { MassApproveAgentModal, MassDeleteHostModal } from '../modals';
import { ActionItemsContext } from '../../../common/components/hosts/HostToolbar';
import { AgentK8sResource } from '../../types';
import { MassChangeHostnameModalProps } from '../../../common/components/hosts/MassChangeHostnameModal';

type MassApproveActionProps = {
  onApprove: VoidFunction;
  selectedAgents: AgentK8sResource[];
};

const MassApproveAction: React.FC<MassApproveActionProps> = ({ onApprove, selectedAgents }) => {
  const isDisabled = React.useContext(ActionItemsContext);

  let disabledDescription = isDisabled ? 'Select one or more hosts to approve' : undefined;
  if (selectedAgents.every((a) => a.spec.approved)) {
    disabledDescription = 'All selected hosts are already approved';
  }
  return (
    <DropdownItem
      onClick={onApprove}
      isDisabled={!!disabledDescription}
      description={disabledDescription}
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
  onChangeHostname,
  onChangeBMHHostname,
  onMassDeleteHost,
  ...actions
}) => {
  const [isDiscoveryHintModalOpen, setDiscoveryHintModalOpen] = React.useState(false);
  const [isMassChangeHostOpen, setMassChangeHostOpen] = React.useState(false);
  const [isMassApproveOpen, setMassApproveOpen] = React.useState(false);
  const [isMassDeleteOpen, setMassDeleteOpen] = React.useState(false);
  const [selectedHostIDs, setSelectedHostIDs] = React.useState<string[]>([]);
  const onSelect = (host: Host, isSelected: boolean) => {
    if (isSelected) {
      setSelectedHostIDs([...selectedHostIDs, host.id]);
    } else {
      setSelectedHostIDs(selectedHostIDs.filter((sa) => sa !== host.id));
    }
  };

  const [hosts, hostActions, actionResolver] = useAgentsTable(
    {
      agents,
      bmhs: bareMetalHosts,
      infraEnv,
    },
    actions,
  );
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
  const selectedAgents = agents.filter((a) => selectedHostIDs.includes(a.metadata?.uid || ''));
  const selectedBMHs = bareMetalHosts.filter((bmh) =>
    selectedHostIDs.includes(bmh.metadata?.uid || ''),
  );

  const massActions = [
    <ChangeHostnameAction
      key="hostname"
      onChangeHostname={() => setMassChangeHostOpen(!isMassChangeHostOpen)}
    />,
    ...(actions.onApprove
      ? [
          <MassApproveAction
            key="approve"
            onApprove={() => setMassApproveOpen(!isMassApproveOpen)}
            selectedAgents={selectedAgents}
          />,
        ]
      : []),
    ...(onMassDeleteHost
      ? [
          <DeleteHostAction
            key="delete"
            onDeleteHost={() => setMassDeleteOpen(!isMassDeleteOpen)}
          />,
        ]
      : []),
  ];

  const onAgentChangeHostname: MassChangeHostnameModalProps['onChangeHostname'] = async (
    host,
    hostname,
  ) => {
    const agent = agents.find((a) => a.metadata?.uid === host.id);
    if (agent) {
      return onChangeHostname(agent, hostname);
    } else {
      const bmh = bareMetalHosts.find((bmh) => bmh.metadata?.uid === host.id);
      return bmh ? onChangeBMHHostname(bmh, hostname) : noop;
    }
  };

  return (
    <>
      <HostToolbar
        hostIDs={hostIDs}
        selectedHostIDs={selectedHostIDs}
        onSelectNone={() => setSelectedHostIDs([])}
        onSelectAll={() => setSelectedHostIDs(hostIDs)}
        actionItems={massActions}
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
        onChangeHostname={onAgentChangeHostname}
        onClose={() => setMassChangeHostOpen(false)}
      />
      {onMassDeleteHost && (
        <MassDeleteHostModal
          isOpen={isMassDeleteOpen}
          agents={selectedAgents}
          bmhs={selectedBMHs}
          onDelete={onMassDeleteHost}
          onClose={() => setMassDeleteOpen(false)}
        />
      )}
      {actions.onApprove && (
        <MassApproveAgentModal
          isOpen={isMassApproveOpen}
          agents={selectedAgents}
          onApprove={actions.onApprove}
          onClose={() => setMassApproveOpen(false)}
        />
      )}
    </>
  );
};

export default InfraEnvAgentTable;
