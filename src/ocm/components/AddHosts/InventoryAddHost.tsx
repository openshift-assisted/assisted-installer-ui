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
import InformationAndAlerts from '../clusterConfiguration/InformationAndAlerts';
import { Cluster, isArmArchitecture } from '../../../common';
import Day2WizardContextProvider from './day2Wizard/Day2WizardContextProvider';
import { Day2DiscoveryImageModalButton, Day2Wizard } from './day2Wizard/Day2Wizard';

const InventoryAddHosts = ({ cluster }: { cluster?: Cluster }) => {
  return !cluster ? null : (
    <Stack hasGutter>
      <StackItem>
        <TextContent>
          <Text component="p">
            <Day2WizardContextProvider>
              <Day2DiscoveryImageModalButton
                ButtonComponent={Button}
                cluster={cluster}
                idPrefix="bare-metal-inventory-add-host"
              />
              <Day2Wizard />
            </Day2WizardContextProvider>
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
