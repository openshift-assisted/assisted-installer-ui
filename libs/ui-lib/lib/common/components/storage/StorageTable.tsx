import * as React from 'react';
import { WithTestID } from '../../index';
import { usePagination } from '../hosts/usePagination';
import AITable, { AITableProps } from '../hosts/AITable';
import { Host } from '@openshift-assisted/types/assisted-installer-service';

const getHostId = (host: Host) => host.id;

type StorageTableProps = ReturnType<typeof usePagination> & {
  hosts: Host[];
  content: AITableProps<Host>['content'];
  actionResolver?: AITableProps<Host>['actionResolver'];
  ExpandComponent?: AITableProps<Host>['ExpandComponent'];
};

const StorageTable = ({ hosts, ...rest }: StorageTableProps & WithTestID) => {
  return (
    <AITable<Host> getDataId={getHostId} data={hosts} {...rest}>
      {''}
    </AITable>
  );
};

export default StorageTable;
