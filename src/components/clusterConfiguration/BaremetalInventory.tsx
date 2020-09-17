import React from 'react';
import { Text, TextContent, Button } from '@patternfly/react-core';
import HostsTable from '../hosts/HostsTable';
import { Cluster } from '../../api/types';
import { DiscoveryImageModalButton } from './discoveryImageModal';
import {
  HostsNotShowingLink,
  DiscoveryTroubleshootingModal,
} from './DiscoveryTroubleshootingModal';

interface BareMetalInventoryProps {
  cluster: Cluster;
}

const BaremetalInventory: React.FC<BareMetalInventoryProps> = ({ cluster }) => {
  const [isDiscoveryHintModalOpen, setDiscoveryHintModalOpen] = React.useState(false);

  return (
    <>
      <TextContent>
        <Text component="h2">Bare Metal Inventory</Text>
        <Text component="p">
          <DiscoveryImageModalButton ButtonComponent={Button} cluster={cluster} />
        </Text>
        <Text component="p">
          Boot the Discovery ISO on hardware that should become part of this bare metal cluster.
          Hosts connected to the internet will be inspected and automatically appear below.{' '}
          <HostsNotShowingLink setDiscoveryHintModalOpen={setDiscoveryHintModalOpen} />
        </Text>
        <Text component="p">
          Three master hosts are required with at least 4 CPU cores, 16 GB of RAM, and 120 GB of
          filesystem storage each. Two or more additional worker hosts are recommended with at least
          2 CPU cores, 8 GB of RAM, and 120 GB of filesystem storage each.
        </Text>
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
