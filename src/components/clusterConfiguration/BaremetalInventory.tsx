import React from 'react';
import { Text, TextContent, Button } from '@patternfly/react-core';
import HostsTable from './HostsTable';
import { Cluster } from '../../api/types';
import { DiscoveryImageModalButton } from './discoveryImageModal';

interface BareMetalInventoryProps {
  cluster: Cluster;
}

const BaremetalInventory: React.FC<BareMetalInventoryProps> = ({ cluster }) => {
  return (
    <>
      <TextContent>
        <Text component="h2">Bare Metal Inventory</Text>
        <Text component="p">
          <DiscoveryImageModalButton ButtonComponent={Button} />
        </Text>
        <Text component="p">
          Boot the discovery ISO on hardware that should become part of this bare metal cluster.
          Hosts connected to the internet will automatically appear below.
        </Text>
      </TextContent>
      <HostsTable cluster={cluster} />
    </>
  );
};

export default BaremetalInventory;
