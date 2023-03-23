import React from 'react';
import { useSelector } from 'react-redux';
import {
  Text,
  TextContent,
  Button,
  Stack,
  StackItem,
  Split,
  SplitItem,
} from '@patternfly/react-core';
import { useFormikContext } from 'formik';
import {
  Cluster,
  HostDiscoveryValues,
  PopoverIcon,
  useFeature,
  ClusterWizardStepHeader,
  selectMastersMustRunWorkloads,
  selectSchedulableMasters,
} from '../../../common';
import HostsDiscoveryTable from '../hosts/HostsDiscoveryTable';
import { DiscoveryImageModalButton } from './DiscoveryImageModal';
import InformationAndAlerts from './InformationAndAlerts';
import { OcmSwitchField } from '../ui/OcmFormFields';
import { selectCurrentClusterPermissionsState } from '../../selectors';
import PlatformIntegration from './platformIntegration/PlatformIntegration';

const schedulableMastersTooltip =
  'This toggle will be "On" and not editable when less than 5 hosts were discovered';

const HostInventory = ({ cluster }: { cluster: Cluster }) => {
  const isPlatformIntegrationFeatureEnabled = useFeature(
    'ASSISTED_INSTALLER_PLATFORM_INTEGRATION_FEATURE',
  );
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
          <TextContent>
            <Text component="p">
              <DiscoveryImageModalButton
                ButtonComponent={Button}
                cluster={cluster}
                idPrefix="host-inventory"
              />
            </Text>
          </TextContent>
        )}
      </StackItem>
      {isPlatformIntegrationFeatureEnabled && (
        <StackItem>
          <Split>
            <PlatformIntegration clusterId={cluster.id} />
          </Split>
        </StackItem>
      )}
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
        <TextContent>
          <Text component="h3">Host Inventory</Text>
        </TextContent>
      </StackItem>
      <StackItem>
        <HostsDiscoveryTable cluster={cluster} />
      </StackItem>
    </Stack>
  );
};
export default HostInventory;
