import * as React from 'react';
import { HostsTableEmptyState } from '../../../../common/components/hosts/HostsTable';
import { ClusterHostsTableProps, isSNO } from '../../../../common';
import { AdditionalNTPSourcesDialogToggle } from '../../hosts/AdditionaNTPSourceDialogToggle';
import { HostsTableModals, useHostsTable } from '../../hosts/use-hosts-table';
import NetworkConfigurationTableBase from './NetworkConfigurationTableBase';

const NetworkConfigurationTable = ({ cluster }: ClusterHostsTableProps) => {
  const { onEditHost, actionResolver, ...modalProps } = useHostsTable(cluster);

  return (
    <>
      <NetworkConfigurationTableBase
        cluster={cluster}
        AdditionalNTPSourcesDialogToggleComponent={AdditionalNTPSourcesDialogToggle}
        onEditHost={onEditHost}
        actionResolver={actionResolver}
      >
        <HostsTableEmptyState isSNO={isSNO(cluster)} />
      </NetworkConfigurationTableBase>
      <HostsTableModals cluster={cluster} {...modalProps} />
    </>
  );
};

export default NetworkConfigurationTable;
