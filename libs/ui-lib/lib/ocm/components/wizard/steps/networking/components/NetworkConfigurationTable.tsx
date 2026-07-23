import * as React from 'react';
import { Cluster } from '@openshift-assisted/types/assisted-installer-service';
import { isSNO, HostsTableEmptyState } from '../../../../../../common';
import {
  HostsTableModals,
  useHostsTable,
  AdditionalNTPSourcesDialogToggle,
} from '../../../../hostsTable';
import { NetworkConfigurationTableBase } from './NetworkConfigurationTableBase';

export const NetworkConfigurationTable = ({ cluster }: { cluster: Cluster }) => {
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
