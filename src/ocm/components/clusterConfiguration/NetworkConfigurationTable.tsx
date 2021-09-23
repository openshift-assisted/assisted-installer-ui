import * as React from 'react';
import { ClusterHostsTableProps } from '../../../common';
import { AdditionalNTPSourcesDialogToggle } from '../hosts/AdditionaNTPSourceDialogToggle';
import { useHostsTable, HostsTableModals } from '../hosts/use-hosts-table';
import CommonNetworkConfigurationTable from '../../../common/components/clusterConfiguration/NetworkConfigurationTable';
import { HostsTableEmptyState } from '../../../common/components/hosts/HostsTable';

const NetworkConfigurationTable: React.FC<ClusterHostsTableProps> = ({
  cluster,
  setDiscoveryHintModalOpen,
  skipDisabled,
}) => {
  const { onEditHost, actionChecks, onEditRole, actionResolver, ...modalProps } = useHostsTable(
    cluster,
  );

  return (
    <>
      <CommonNetworkConfigurationTable
        cluster={cluster}
        skipDisabled={skipDisabled}
        AdditionalNTPSourcesDialogToggleComponent={AdditionalNTPSourcesDialogToggle}
        canEditRole={actionChecks.canEditRole}
        onEditHost={onEditHost}
        onEditRole={onEditRole}
        actionResolver={actionResolver}
      >
        <HostsTableEmptyState setDiscoveryHintModalOpen={setDiscoveryHintModalOpen} />
      </CommonNetworkConfigurationTable>
      <HostsTableModals cluster={cluster} {...modalProps} />
    </>
  );
};

export default NetworkConfigurationTable;
