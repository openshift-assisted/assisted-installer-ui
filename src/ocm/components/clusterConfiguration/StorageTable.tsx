import * as React from 'react';
import { ExpandComponentProps, AITableProps } from '../../../common/components/hosts/AITable';
import { Host, WithTestID } from '../../../common';
import { usePagination } from '../../../common/components/hosts/usePagination';
import { StorageDetail } from './StorageDetail';
import AITable from '../../../common/components/hosts/AITable';

const getHostId = (host: Host) => host.id;

export const DefaultExpandComponent: React.FC<ExpandComponentProps<Host>> = ({ obj }) => (
  <StorageDetail key={obj.id} host={obj} />
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

const StorageTable: React.FC<HostsTableProps & WithTestID> = ({ hosts, skipDisabled, ...rest }) => {
  const data = React.useMemo(
    () => (hosts || []).filter((host) => !skipDisabled || host.status !== 'disabled'),
    [hosts, skipDisabled],
  );

  return <AITable<Host> getDataId={getHostId} data={data} isStorageTable={true} {...rest} />;
};

export default StorageTable;
