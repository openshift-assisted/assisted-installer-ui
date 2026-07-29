import React from 'react';
import { Content, Alert, AlertVariant, Stack, StackItem } from '@patternfly/react-core';
import { Cluster } from '@openshift-assisted/types/assisted-installer-service';
import { CpuArchitecture } from '../../../common';
import { ClusterHostsTable } from '../hostsTable/ClusterHostsTable';
import { InformationAndAlerts } from '../information';
import Day2WizardContextProvider from './day2Wizard/Day2WizardContextProvider';
import Day2DiscoveryImageModalButton from './day2Wizard/Day2DiscoveryImageModalButton';
import Day2Wizard from './day2Wizard/Day2Wizard';

export const InventoryAddHosts = ({ cluster }: { cluster?: Cluster }) => {
  if (!cluster) {
    return null;
  }

  const showArmOnlyAlert = cluster.cpuArchitecture === CpuArchitecture.ARM;
  return (
    <Stack hasGutter>
      <StackItem>
        <Day2WizardContextProvider>
          <Content component="p">
            <Day2DiscoveryImageModalButton cluster={cluster} />
          </Content>
          <Day2Wizard />
        </Day2WizardContextProvider>
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
