import React from 'react';
import { Text, TextContent, Button } from '@patternfly/react-core';
import HostsTable from '../hosts/HostsTable';
import { Cluster } from '../../api/types';
import { DiscoveryImageModalButton } from './discoveryImageModal';
import { DiscoveryTroubleshootingModalButton } from './discoveryTroubleshootingModal';

interface BareMetalInventoryProps {
  cluster: Cluster;
}

const BaremetalInventory: React.FC<BareMetalInventoryProps> = ({ cluster }) => {
  return (
    <>
      <TextContent>
        <Text component="h2">Bare Metal Inventory</Text>
        <Text component="p">
          <DiscoveryImageModalButton ButtonComponent={Button} imageInfo={cluster.imageInfo} />
        </Text>
        <Text component="p">
          Boot the discovery ISO on hardware that should become part of this bare metal cluster.
          Hosts connected to the internet will be inspected and automatically appear below.{' '}
          <DiscoveryTroubleshootingModalButton>
            Hosts not showing up?
          </DiscoveryTroubleshootingModalButton>
        </Text>
        <Text component="p">
          Three master hosts are required with at least 4 CPU cores, 16 GB of RAM, and 120 GB of
          filesystem storage each. Two or more additional worker hosts are recommended with at least
          2 CPU cores, 8 GB of RAM, and 120 GB of filesystem storage each.
        </Text>
      </TextContent>
      <HostsTable cluster={cluster} />
    </>
  );
};

export default BaremetalInventory;
