import React from 'react';
import { Content, Alert, AlertVariant, Stack, StackItem } from '@patternfly/react-core';
import ClusterHostsTable from '../hosts/ClusterHostsTable';
import InformationAndAlerts from '../clusterConfiguration/InformationAndAlerts';
import { CpuArchitecture } from '../../../common';
import Day2WizardContextProvider from './day2Wizard/Day2WizardContextProvider';
import Day2DiscoveryImageModalButton from './day2Wizard/Day2DiscoveryImageModalButton';
import Day2Wizard from './day2Wizard/Day2Wizard';
import { Cluster } from '@openshift-assisted/types/assisted-installer-service';

const InventoryAddHosts = ({ cluster }: { cluster?: Cluster }) => {
  if (!cluster) {
    return null;
  }

  const showArmOnlyAlert = cluster.cpuArchitecture === CpuArchitecture.ARM;
  return (
    <Stack hasGutter>
      <StackItem>
        <Content>
          <Content component="p">
            <Day2WizardContextProvider>
              <Day2DiscoveryImageModalButton cluster={cluster} />
              <Day2Wizard />
            </Day2WizardContextProvider>
          </Content>
        </Content>
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
