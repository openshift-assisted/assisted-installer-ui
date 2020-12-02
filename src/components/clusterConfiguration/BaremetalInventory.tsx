import React from 'react';
import { Text, TextContent, Button } from '@patternfly/react-core';
import HostsTable from '../hosts/HostsTable';
import { Cluster, HostRequirements as HostRequirementsType } from '../../api/types';
import HostRequirements from '../fetching/HostRequirements';
import { DiscoveryImageModalButton } from './discoveryImageModal';
import {
  HostsNotShowingLink,
  DiscoveryTroubleshootingModal,
} from './DiscoveryTroubleshootingModal';
import FormatDiskWarning from './FormatDiskWarning';

const HostRequirementsContent = ({
  worker = {},
  master = {},
}: {
  worker?: HostRequirementsType['worker'];
  master?: HostRequirementsType['master'];
}) => (
  <Text component="p">
    Three master hosts are required with at least {master.cpuCores || 4} CPU cores,{' '}
    {master.ramGib || 16} GB of RAM, and {master.diskSizeGb || 120} GB of filesystem storage each.
    Two or more additional worker hosts are recommended with at least {worker.cpuCores || 2} CPU
    cores, {worker.ramGib || 8} GB of RAM, and {worker.diskSizeGb || 120}
    GB of filesystem storage each.
  </Text>
);

const BaremetalInventory: React.FC<{ cluster: Cluster }> = ({ cluster }) => {
  const [isDiscoveryHintModalOpen, setDiscoveryHintModalOpen] = React.useState(false);

  return (
    <>
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
        <HostRequirements ContentComponent={HostRequirementsContent} />
        <FormatDiskWarning />
      </TextContent>
      <HostsTable cluster={cluster} setDiscoveryHintModalOpen={setDiscoveryHintModalOpen} />
      <DiscoveryTroubleshootingModal
        isOpen={isDiscoveryHintModalOpen}
        setDiscoveryHintModalOpen={setDiscoveryHintModalOpen}
      />
    </>
  );
};

export default BaremetalInventory;
