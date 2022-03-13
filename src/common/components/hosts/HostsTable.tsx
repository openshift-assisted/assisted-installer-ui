import { ConnectedIcon } from '@patternfly/react-icons';
import * as React from 'react';
import {
  HostsNotShowingLink,
  HostsNotShowingLinkProps,
} from '../clusterConfiguration/DiscoveryTroubleshootingModal';
import { Host } from '../../api';
import AITable, {
  ExpandComponentProps,
  AITableProps,
} from '../../../common/components/hosts/AITable';
import { HostDetail } from '../../../common/components/hosts/HostRowDetail';
import { WithTestID } from '../../types';
import EmptyState from '../ui/uiState/EmptyState';
import { usePagination } from './usePagination';
import { pluralize } from 'humanize-plus';

const getHostId = (host: Host) => host.id;

type HostsTableEmptyStateProps = {
  setDiscoveryHintModalOpen?: HostsNotShowingLinkProps['setDiscoveryHintModalOpen'];
  isSNO?: boolean;
};

export const HostsTableEmptyState: React.FC<HostsTableEmptyStateProps> = ({
  setDiscoveryHintModalOpen,
  isSNO = false,
}) => (
  <EmptyState
    icon={ConnectedIcon}
    title={`Waiting for ${pluralize(+isSNO, 'host')}...`}
    content="Hosts may take a few minutes to appear here after booting."
    secondaryActions={
      setDiscoveryHintModalOpen && [
        <HostsNotShowingLink
          key="hosts-not-showing"
          isSNO={isSNO}
          setDiscoveryHintModalOpen={setDiscoveryHintModalOpen}
        />,
      ]
    }
  />
);

export const DefaultExpandComponent: React.FC<ExpandComponentProps<Host>> = ({ obj }) => (
  <HostDetail key={obj.id} host={obj} />
);

type HostsTableProps = ReturnType<typeof usePagination> & {
  hosts: Host[];
  skipDisabled?: boolean;
  content: AITableProps<Host>['content'];
  actionResolver?: AITableProps<Host>['actionResolver'];
  children: React.ReactNode;
  onSelect?: AITableProps<Host>['onSelect'];
  selectedIDs?: AITableProps<Host>['selectedIDs'];
  setSelectedHostIDs?: AITableProps<Host>['setSelectedIDs'];
  ExpandComponent?: AITableProps<Host>['ExpandComponent'];
  className?: AITableProps<Host>['className'];
};

const HostsTable: React.FC<HostsTableProps & WithTestID> = ({ hosts, skipDisabled, ...rest }) => {
  const data = React.useMemo(
    () => (hosts || []).filter((host) => !skipDisabled || host.status !== 'disabled'),
    [hosts, skipDisabled],
  );

  return <AITable<Host> getDataId={getHostId} data={data} {...rest} />;
};

export default HostsTable;
