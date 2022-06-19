import React from 'react';
import {
  Text,
  TextContent,
  Button,
  Alert,
  AlertVariant,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import ClusterHostsTable from '../hosts/ClusterHostsTable';
import { DiscoveryImageModalButton } from '../clusterConfiguration/discoveryImageModal';
import InformationAndAlerts from '../clusterConfiguration/InformationAndAlerts';
import { AddHostsContext, DiscoveryInstructions, isArmArchitecture, isSNO } from '../../../common';

const armArchAlert = (
  <Alert
    title="Only hosts that have arm64 cpu architecture can be added to this cluster."
    variant={AlertVariant.info}
    data-testid="arm-architecture-alert"
    isInline
  />
);

const InventoryAddHosts: React.FC = () => {
  const { cluster } = React.useContext(AddHostsContext);

  if (!cluster) {
    return null;
  }

  const isSNOCluster = isSNO(cluster);

  return (
    <Stack hasGutter>
      <StackItem>
        <TextContent>
          <DiscoveryInstructions isSNO={isSNOCluster} showAllInstructions />
          <Text component="p">
            <DiscoveryImageModalButton
              ButtonComponent={Button}
              cluster={cluster}
              idPrefix="bare-metal-inventory-add-host"
            />
          </Text>
          <InformationAndAlerts cluster={cluster} />
        </TextContent>
      </StackItem>
      {isArmArchitecture(cluster) && <StackItem>{armArchAlert}</StackItem>}
      <StackItem>
        <ClusterHostsTable cluster={cluster} />
      </StackItem>
    </Stack>
  );
};

export default InventoryAddHosts;
