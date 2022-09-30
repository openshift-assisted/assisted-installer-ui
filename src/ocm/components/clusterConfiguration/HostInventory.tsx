import React from 'react';
import { useSelector } from 'react-redux';
import {
  Text,
  TextContent,
  Button,
  Stack,
  StackItem,
  List,
  ListItem,
  Title,
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
  isClusterPlatformTypeVM,
  isClusterPlatformTypeVsphere,
  isClusterPlatformTypeNutanix,
} from '../../../common';
import HostsDiscoveryTable from '../hosts/HostsDiscoveryTable';
import { DiscoveryImageModalButton } from './discoveryImageModal';
import InformationAndAlerts from './InformationAndAlerts';
import { useClusterSupportedPlatforms } from '../../hooks';
import { OcmSwitchField } from '../ui/OcmFormFields';
import { selectCurrentClusterPermissionsState } from '../../selectors';

const PlatformIntegrationLabel: React.FC<{
  isPlatformTypeVsphere: boolean;
  isPlatformTypeNutanix: boolean;
}> = ({ isPlatformTypeVsphere, isPlatformTypeNutanix }) => {
  let message =
    'Enable platform integration to access features directly in OpenShift, like vSphere node auto-scaling and persistent storage or Nutanix node auto-scaling.';
  if (isPlatformTypeVsphere && !isPlatformTypeNutanix) {
    message =
      "Enable vSphere platform integration to access features directly inside OpenShift like node auto-scaling and persistent storage directly inside OpenShift. You'll need to set vSphere configuration after cluster installation is complete.";
  } else if (isPlatformTypeNutanix && !isPlatformTypeVsphere) {
    message =
      'Enable Nutanix platform integration to access features directly inside OpenShift like node auto-scaling .';
  }
  return (
    <>
      <span>Integrate with platform (vSphere/Nutanix)</span>{' '}
      <PopoverIcon
        bodyContent={message}
        footerContent={
          isPlatformTypeVsphere && (
            <>
              <Title headingLevel="h6">Requirements</Title>
              <List>
                <ListItem>A network connection between vSphere and the installed OCP.</ListItem>
                <ListItem>
                  Ensure clusterSet <code>disk.enableUUID</code> is set to <code>true</code> inside
                  of vSphere
                </ListItem>
              </List>
            </>
          )
        }
        buttonOuiaId="platform-integration-vSphere-popover"
      />
    </>
  );
};

const SchedulableMastersLabel = () => (
  <>
    <span>Run workloads on control plane nodes</span>{' '}
    <PopoverIcon
      bodyContent={<p>Enables your control plane nodes to be used for running applications.</p>}
    />
  </>
);

const platformIntegrationTooltip =
  'Platform integration is only applicable when all discovered hosts originated from the same platform.';

const schedulableMastersTooltip =
  'This toggle will be "On" and not editable when less than 5 hosts were discovered';

const HostInventory = ({ cluster }: { cluster: Cluster }) => {
  const { isPlatformIntegrationSupported } = useClusterSupportedPlatforms(cluster.id);
  const isPlatformIntegrationFeatureEnabled = useFeature(
    'ASSISTED_INSTALLER_PLATFORM_INTEGRATION_FEATURE',
  );
  const mastersMustRunWorkloads = selectMastersMustRunWorkloads(cluster);
  const { setFieldValue } = useFormikContext<HostDiscoveryValues>();
  const { isViewerMode } = useSelector(selectCurrentClusterPermissionsState);

  React.useEffect(() => {
    setFieldValue('schedulableMasters', selectSchedulableMasters(cluster));
  }, [mastersMustRunWorkloads]); // Schedulable masters need to be recalculated only when forced status changes

  return (
    <Stack hasGutter>
      <StackItem>
        <ClusterWizardStepHeader>Host discovery</ClusterWizardStepHeader>
      </StackItem>
      <StackItem>
        {!isViewerMode && (
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
          <Split hasGutter>
            <SplitItem>
              <OcmSwitchField
                tooltipProps={{
                  hidden: isPlatformIntegrationSupported,
                  content: platformIntegrationTooltip,
                }}
                isDisabled={!isPlatformIntegrationSupported && !isClusterPlatformTypeVM(cluster)}
                name={'usePlatformIntegration'}
                label={
                  <PlatformIntegrationLabel
                    isPlatformTypeVsphere={isClusterPlatformTypeVsphere(cluster)}
                    isPlatformTypeNutanix={isClusterPlatformTypeNutanix(cluster)}
                  />
                }
                switchOuiaId="platform-integration-switch"
              />
            </SplitItem>
          </Split>
        </StackItem>
      )}
      <StackItem>
        <OcmSwitchField
          tooltipProps={{
            hidden: !mastersMustRunWorkloads,
            content: schedulableMastersTooltip,
          }}
          isDisabled={mastersMustRunWorkloads}
          name={'schedulableMasters'}
          label={<SchedulableMastersLabel />}
        />
      </StackItem>
      <StackItem>
        <TextContent>
          <InformationAndAlerts cluster={cluster} />
        </TextContent>
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
