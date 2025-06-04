import React from 'react';
import { useSelector } from 'react-redux';
import {
  Content,
  Button,
  Stack,
  StackItem,
  Split,
  SplitItem,
} from '@patternfly/react-core';
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
    <Stack hasGutter>
      <StackItem>
        <ClusterWizardStepHeader>Host discovery</ClusterWizardStepHeader>
      </StackItem>
      <StackItem>
        {!isViewerMode && !isSingleClusterFeatureEnabled && (
          <Content>
            <Content component="p">
              <DiscoveryImageModalButton
                ButtonComponent={Button}
                cluster={cluster}
                idPrefix="host-inventory"
              />
            </Content>
          </Content>
        )}
      </StackItem>
      <StackItem>
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
            />
          </SplitItem>
          <SplitItem>
            <PopoverIcon
              bodyContent={
                <p>Enables your control plane nodes to be used for running applications.</p>
              }
              buttonStyle={{ marginTop: '4px' }}
            />
          </SplitItem>
        </Split>
      </StackItem>
      <StackItem>
        <InformationAndAlerts cluster={cluster} />
      </StackItem>
      <StackItem>
        <Content>
          <Content component="h3">Host Inventory</Content>
        </Content>
      </StackItem>
      <StackItem>
        <HostsDiscoveryTable cluster={cluster} />
      </StackItem>
    </Stack>
  );
};
export default HostInventory;
