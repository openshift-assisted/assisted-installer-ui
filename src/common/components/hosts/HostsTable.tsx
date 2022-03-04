import { ConnectedIcon } from '@patternfly/react-icons';
import * as React from 'react';
import {
  HostsNotShowingLink,
  HostsNotShowingLinkProps,
} from '../clusterConfiguration/DiscoveryTroubleshootingModal';
import { Host } from '../../api';
import AITable, {
  ActionsResolver,
  ExpandComponentProps,
  TableRow,
} from '../../../common/components/hosts/AITable';
import { HostDetail } from '../../../common/components/hosts/HostRowDetail';
import { WithTestID } from '../../types';
import EmptyState from '../ui/uiState/EmptyState';

const getHostId = (host: Host) => host.id;

type HostsTableEmptyStateProps = {
  setDiscoveryHintModalOpen?: HostsNotShowingLinkProps['setDiscoveryHintModalOpen'];
};

export const HostsTableEmptyState: React.FC<HostsTableEmptyStateProps> = ({
  setDiscoveryHintModalOpen,
}) => (
  <EmptyState
    icon={ConnectedIcon}
    title="Waiting for hosts..."
    content="Hosts may take a few minutes to appear here after booting."
    secondaryActions={
      setDiscoveryHintModalOpen && [
        <HostsNotShowingLink
          key="hosts-not-showing"
          setDiscoveryHintModalOpen={setDiscoveryHintModalOpen}
        />,
      ]
    }
  />
);

export const DefaultExpandComponent: React.FC<ExpandComponentProps<Host>> = ({ obj }) => (
  <HostDetail key={obj.id} host={obj} />
);

type HostsTableProps = {
  hosts: Host[];
  skipDisabled?: boolean;
  content: TableRow<Host>[];
  actionResolver?: ActionsResolver<Host>;
  children: React.ReactNode;
  onSelect?: (obj: Host, isSelected: boolean) => void;
  selectedIDs?: string[];
  setSelectedHostIDs?: (selectedHosts: string[]) => void;
  ExpandComponent?: React.ComponentType<ExpandComponentProps<Host>>;
  className?: string;
};

const HostsTable: React.FC<HostsTableProps & WithTestID> = ({
  hosts,
  skipDisabled,
  children,
  content,
  actionResolver,
  ExpandComponent,
  className,
  testId,
  onSelect,
  selectedIDs,
  setSelectedHostIDs,
}) => {
  const data = React.useMemo(
    () => (hosts || []).filter((host) => !skipDisabled || host.status !== 'disabled'),
    [hosts, skipDisabled],
  );

  return (
    <AITable<Host>
      getDataId={getHostId}
      data={data}
      ExpandComponent={ExpandComponent}
      content={content}
      actionResolver={actionResolver}
      className={className}
      testId={testId}
      onSelect={onSelect}
      selectedIDs={selectedIDs}
      setSelectedIDs={setSelectedHostIDs}
    >
      {children}
    </AITable>
  );
};

export default HostsTable;
