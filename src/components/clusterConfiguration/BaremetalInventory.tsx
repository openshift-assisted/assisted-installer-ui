import React from 'react';
import { Text, TextContent, Button, Stack, StackItem } from '@patternfly/react-core';
import HostsTable from '../hosts/HostsTable';
import { Cluster, HostRequirements as HostRequirementsType } from '../../api/types';
import HostRequirements from '../fetching/HostRequirements';
import VMRebootConfigurationInfo from '../hosts/VMRebootConfigurationInfo';
import { DiscoveryImageModalButton } from './discoveryImageModal';
import {
  HostsNotShowingLink,
  DiscoveryTroubleshootingModal,
} from './DiscoveryTroubleshootingModal';
import FormatDiskWarning from './FormatDiskWarning';
import { isSingleNodeCluster } from './utils';

const HostRequirementsContent = ({
  worker = {},
  master = {},
}: {
  worker?: HostRequirementsType['worker'];
  master?: HostRequirementsType['master'];
}) => (
  <Text component="p">
    Three master hosts are required with at least {master.cpuCores || 4} CPU cores,{' '}
    {master.ramGib || 16} Gib of RAM, and {master.diskSizeGb || 120} Gib of filesystem storage each.
    Two or more additional worker hosts are recommended with at least {worker.cpuCores || 2} CPU
    cores, {worker.ramGib || 8} Gib of RAM, and {worker.diskSizeGb || 120}
    Gib of filesystem storage each.
  </Text>
);

const SingleHostRequirementsContent = ({
  master = {},
}: {
  master?: HostRequirementsType['master'];
}) => (
  <Text component="p">
    One host is required with at least {master.cpuCores || 4} CPU cores, {master.ramGib || 16} Gib
    of RAM, and {master.diskSizeGb || 120} Gib of filesystem storage.
  </Text>
);

const BaremetalInventory: React.FC<{ cluster: Cluster }> = ({ cluster }) => {
  const [isDiscoveryHintModalOpen, setDiscoveryHintModalOpen] = React.useState(false);
  // const isOpenshiftClusterStorageEnabled = useFeature('ASSISTED_INSTALLER_OCS_FEATURE');

  return (
    <Stack hasGutter>
      <StackItem>
        <TextContent>
          <Text component="h2">Bare Metal Discovery</Text>
        </TextContent>
      </StackItem>
      <StackItem>
        <TextContent>
          <Text component="p">
            <DiscoveryImageModalButton
              ButtonComponent={Button}
              cluster={cluster}
              idPrefix="bare-metal-inventory"
            />
          </Text>
          <Text component="p">
            Boot the Discovery ISO on hardware that should become part of this bare metal cluster.
            Hosts connected to the internet will be inspected and automatically appear below.{' '}
            <HostsNotShowingLink setDiscoveryHintModalOpen={setDiscoveryHintModalOpen} />
          </Text>
          {isSingleNodeCluster(cluster) ? (
            <HostRequirements ContentComponent={SingleHostRequirementsContent} />
          ) : (
            <HostRequirements ContentComponent={HostRequirementsContent} />
          )}
          {/* TODO(jtomasek): Turn baremetal inventory into a form and enable this field */}
          {/* {isOpenshiftClusterStorageEnabled && (
            <CheckboxField
              name="useExtraDisksForLocalStorage"
              label="Use extra disks for local storage."
              helperText="Non-boot disks will be usable by workloads for persistent storage."
            />
          )}
          <Text /> */}
          <FormatDiskWarning />
          <VMRebootConfigurationInfo hosts={cluster.hosts} />
        </TextContent>
        <HostsTable cluster={cluster} setDiscoveryHintModalOpen={setDiscoveryHintModalOpen} />
        <DiscoveryTroubleshootingModal
          isOpen={isDiscoveryHintModalOpen}
          setDiscoveryHintModalOpen={setDiscoveryHintModalOpen}
        />
      </StackItem>
    </Stack>
  );
};

export default BaremetalInventory;
