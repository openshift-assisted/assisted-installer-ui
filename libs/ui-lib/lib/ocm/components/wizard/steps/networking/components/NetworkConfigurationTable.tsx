import * as React from 'react';
import { ClusterHostsTableProps, isSNO, HostsTableEmptyState } from '../../../../../../common';
import {
  HostsTableModals,
  useHostsTable,
  AdditionalNTPSourcesDialogToggle,
} from '../../../../hosts';
import { NetworkConfigurationTableBase } from './NetworkConfigurationTableBase';

export const NetworkConfigurationTable = ({ cluster }: ClusterHostsTableProps) => {
  const { actionChecks, onEditHost, actionResolver, ...modalProps } = useHostsTable(cluster);

  return (
    <>
      <NetworkConfigurationTableBase
        cluster={cluster}
        AdditionalNTPSourcesDialogToggleComponent={AdditionalNTPSourcesDialogToggle}
        onEditHost={onEditHost}
        canEditHostname={actionChecks.canEditHostname}
        actionResolver={actionResolver}
      >
        <HostsTableEmptyState isSNO={isSNO(cluster)} />
      </NetworkConfigurationTableBase>
      <HostsTableModals cluster={cluster} {...modalProps} />
    </>
  );
};
