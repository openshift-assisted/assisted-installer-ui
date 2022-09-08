import React from 'react';
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
import {
  Cluster,
  PopoverIcon,
  useFeature,
  ClusterWizardStepHeader,
  SwitchField,
  selectMastersMustRunWorkloads,
  selectSchedulableMasters,
  HostDiscoveryValues,
  isClusterPlatformTypeVM,
} from '../../../common';
import HostsDiscoveryTable from '../hosts/HostsDiscoveryTable';
import { DiscoveryImageModalButton } from './discoveryImageModal';
import InformationAndAlerts from './InformationAndAlerts';
import { useClusterSupportedPlatforms } from '../../hooks';
import { useFormikContext } from 'formik';

const PlatformIntegrationLabel: React.FC = () => (
  <>
    <span>Integrate with vSphere</span>{' '}
    <PopoverIcon
      bodyContent={
        <>
          Enable vSphere integration to access features like node auto-scaling and persistent
          storage directly inside OpenShift. You'll need to set vSphere configuration after cluster
          installation is complete.
        </>
      }
      footerContent={
        <>
          <Title headingLevel="h6">Requirements</Title>
          <List>
            <ListItem>A network connection between vSphere and the installed OCP cluster</ListItem>
            <ListItem>
              Set <code>disk.enableUUID</code> to <code>true</code> inside vSphere
            </ListItem>
          </List>
        </>
      }
      buttonOuiaId="platform-integration-vSphere-popover"
    />
  </>
);

const SchedulableMastersLabel = () => (
  <>
    <span>Run workloads on control plane nodes</span>{' '}
    <PopoverIcon
      bodyContent={<p>Enables your control plane nodes to be used for running applications.</p>}
    />
  </>
);

const platformIntegrationTooltip =
  'vSphere integration is applicable only when all discovered hosts are vSphere originated';

const schedulableMastersTooltip =
  'This toggle will be "On" and not editable when less than 5 hosts were discovered';

const HostInventory = ({ cluster }: { cluster: Cluster }) => {
  const { isPlatformIntegrationSupported } = useClusterSupportedPlatforms(cluster.id);
  const isPlatformIntegrationFeatureEnabled = useFeature(
    'ASSISTED_INSTALLER_PLATFORM_INTEGRATION_FEATURE',
  );
  const mastersMustRunWorkloads = selectMastersMustRunWorkloads(cluster);
  const { setFieldValue } = useFormikContext<HostDiscoveryValues>();

  React.useEffect(() => {
    setFieldValue('schedulableMasters', selectSchedulableMasters(cluster));
  }, [mastersMustRunWorkloads]); // Schedulable masters need to be recalculated only when forced status changes

  return (
    <Stack hasGutter>
      <StackItem>
        <ClusterWizardStepHeader>Host discovery</ClusterWizardStepHeader>
      </StackItem>
      <StackItem>
        <TextContent>
          <Text component="p">
            <DiscoveryImageModalButton
              ButtonComponent={Button}
              cluster={cluster}
              idPrefix="host-inventory"
            />
          </Text>
        </TextContent>
      </StackItem>
      {isPlatformIntegrationFeatureEnabled && (
        <StackItem>
          <Split hasGutter>
            <SplitItem>
              <SwitchField
                tooltipProps={{
                  hidden: isPlatformIntegrationSupported,
                  content: platformIntegrationTooltip,
                }}
                isDisabled={!isPlatformIntegrationSupported && !isClusterPlatformTypeVM(cluster)}
                name={'usePlatformIntegration'}
                label={<PlatformIntegrationLabel />}
                switchOuiaId="platform-integration-vSphere-switch"
              />
            </SplitItem>
          </Split>
        </StackItem>
      )}
      <StackItem>
        <SwitchField
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
