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
import { Cluster, isArmArchitecture } from '../../../common';

const InventoryAddHosts = ({ cluster }: { cluster?: Cluster }) => {
  return !cluster ? null : (
    <Stack hasGutter>
      <StackItem>
        <TextContent>
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
      {isArmArchitecture(cluster) && (
        <StackItem>
          <Alert
            title="Only hosts that have arm64 cpu architecture can be added to this cluster."
            variant={AlertVariant.info}
            data-testid="arm-architecture-alert"
            isInline
          />
        </StackItem>
      )}
      <StackItem>
        <ClusterHostsTable cluster={cluster} />
      </StackItem>
    </Stack>
  );
};

export default InventoryAddHosts;
