import React from 'react';
import { Text, TextContent, Alert, AlertVariant, Stack, StackItem } from '@patternfly/react-core';
import ClusterHostsTable from '../hosts/ClusterHostsTable';
import InformationAndAlerts from '../clusterConfiguration/InformationAndAlerts';
import { canSelectCpuArchitecture, Cluster, isArmArchitecture } from '../../../common';
import Day2WizardContextProvider from './day2Wizard/Day2WizardContextProvider';
import Day2DiscoveryImageModalButton from './day2Wizard/Day2DiscoveryImageModalButton';
import Day2Wizard from './day2Wizard/Day2Wizard';

const InventoryAddHosts = ({ cluster }: { cluster?: Cluster }) => {
  if (!cluster) {
    return null;
  }

  const showArmOnlyAlert = !canSelectCpuArchitecture(cluster) && isArmArchitecture(cluster);
  return (
    <Stack hasGutter>
      <StackItem>
        <TextContent>
          <Text component="p">
            <Day2WizardContextProvider>
              <Day2DiscoveryImageModalButton cluster={cluster} />
              <Day2Wizard />
            </Day2WizardContextProvider>
          </Text>
        </TextContent>
      </StackItem>
      <StackItem>
        <InformationAndAlerts cluster={cluster} />
      </StackItem>
      {showArmOnlyAlert && (
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
