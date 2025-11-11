import React from 'react';
import { useSelector } from 'react-redux';
import { Content, Button, Stack, StackItem, Split, SplitItem } from '@patternfly/react-core';
import { useFormikContext } from 'formik';
import {
  HostDiscoveryValues,
  PopoverIcon,
  ClusterWizardStepHeader,
  selectMastersMustRunWorkloads,
  selectSchedulableMasters,
} from '../../../common';
import HostsDiscoveryTable from '../hosts/HostsDiscoveryTable';
import { DiscoveryImageModalButton } from './DiscoveryImageModal';
import InformationAndAlerts from './InformationAndAlerts';
import { OcmSwitchField } from '../ui/OcmFormFields';
import { selectCurrentClusterPermissionsState } from '../../store/slices/current-cluster/selectors';
import { Cluster } from '@openshift-assisted/types/assisted-installer-service';
import { useFeature } from '../../hooks/use-feature';

const schedulableMastersTooltip =
  'Workloads must be run on control plane nodes when less than 5 hosts are discovered';

const HostInventory = ({ cluster }: { cluster: Cluster }) => {
  const isSingleClusterFeatureEnabled = useFeature('ASSISTED_INSTALLER_SINGLE_CLUSTER_FEATURE');
  const mastersMustRunWorkloads = selectMastersMustRunWorkloads(cluster);
  const { setFieldValue } = useFormikContext<HostDiscoveryValues>();
  const { isViewerMode } = useSelector(selectCurrentClusterPermissionsState);

  React.useEffect(() => {
    setFieldValue('schedulableMasters', selectSchedulableMasters(cluster));
  }, [cluster, mastersMustRunWorkloads, setFieldValue]); // Schedulable masters need to be recalculated only when forced status changes

  return (
    <Stack hasGutter data-testid="host-inventory">
      <StackItem data-testid="host-discovery-header">
        <ClusterWizardStepHeader>Host discovery</ClusterWizardStepHeader>
      </StackItem>
      <StackItem data-testid="discovery-image-modal-section">
        {!isViewerMode && !isSingleClusterFeatureEnabled && (
          <Content component="p">
            <DiscoveryImageModalButton
              ButtonComponent={Button}
              cluster={cluster}
              idPrefix="host-inventory"
            />
          </Content>
        )}
      </StackItem>
      <StackItem data-testid="schedulable-masters-section">
        <Split>
          <SplitItem>
            <OcmSwitchField
              tooltipProps={{
                hidden: !mastersMustRunWorkloads,
                content: schedulableMastersTooltip,
              }}
              isDisabled={mastersMustRunWorkloads}
              name={'schedulableMasters'}
              label="Run workloads on control plane nodes&nbsp;"
              data-testid="schedulable-masters-switch"
            />
          </SplitItem>
          <SplitItem>
            <PopoverIcon
              bodyContent={
                <p>Enables your control plane nodes to be used for running applications.</p>
              }
              buttonStyle={{ marginTop: '4px' }}
              data-testid="schedulable-masters-popover"
            />
          </SplitItem>
        </Split>
      </StackItem>
      <StackItem data-testid="information-and-alerts">
        <InformationAndAlerts cluster={cluster} />
      </StackItem>
      <StackItem data-testid="host-inventory-title">
        <Content component="h3">Host Inventory</Content>
      </StackItem>
      <StackItem data-testid="hosts-discovery-table-wrapper">
        <HostsDiscoveryTable cluster={cluster} hosts={cluster.hosts || []} />
      </StackItem>
    </Stack>
  );
};
export default HostInventory;
