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
  isSNO,
  ClusterWizardStepHeader,
  SwitchField,
  schedulableMastersAlwaysOn,
  HostDiscoveryValues,
  getSchedulableMasters,
} from '../../../common';
import HostsDiscoveryTable from '../hosts/HostsDiscoveryTable';
import { DiscoveryImageModalButton } from './discoveryImageModal';
import InformationAndAlerts from './InformationAndAlerts';
import ClusterWizardHeaderExtraActions from './ClusterWizardHeaderExtraActions';
import { useClusterSupportedPlatforms } from '../../hooks';
import { useFormikContext } from 'formik';
import { ODFCheckbox } from './ODFCheckbox';
import { CnvCheckbox } from './CnvCheckbox';

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
    />
  </>
);

const SchedulableMastersLabel: React.FC = () => (
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

const HostInventory: React.FC<{ cluster: Cluster }> = ({ cluster }) => {
  const { isPlatformIntegrationSupported } = useClusterSupportedPlatforms(cluster.id);
  const isPlatformIntegrationFeatureEnabled = useFeature(
    'ASSISTED_INSTALLER_PLATFORM_INTEGRATION_FEATURE',
  );
  const isOpenshiftClusterStorageEnabled = useFeature('ASSISTED_INSTALLER_OCS_FEATURE');
  const isContainerNativeVirtualizationEnabled = useFeature('ASSISTED_INSTALLER_CNV_FEATURE');
  const isSNOCluster = isSNO(cluster);
  const isSchedulableMastersEnabled = !schedulableMastersAlwaysOn(cluster);
  const { setFieldValue } = useFormikContext<HostDiscoveryValues>();
  React.useEffect(() => {
    setFieldValue('schedulableMasters', getSchedulableMasters(cluster));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSchedulableMastersEnabled]); //just when changes from disabled to enabled, shouldn't respond to continous polling otherwise
  return (
    <Stack hasGutter>
      <StackItem>
        <ClusterWizardStepHeader extraItems={<ClusterWizardHeaderExtraActions cluster={cluster} />}>
          Host discovery
        </ClusterWizardStepHeader>
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
      {isContainerNativeVirtualizationEnabled && (
        <StackItem>
          <CnvCheckbox
            clusterId={cluster.id}
            isSNO={isSNOCluster}
            openshiftVersion={cluster.openshiftVersion}
          />
        </StackItem>
      )}
      {isOpenshiftClusterStorageEnabled && (
        <StackItem>
          <ODFCheckbox openshiftVersion={cluster.openshiftVersion} />
        </StackItem>
      )}
      {isPlatformIntegrationFeatureEnabled && (
        <StackItem>
          <Split hasGutter>
            <SplitItem>
              <SwitchField
                tooltipProps={{
                  hidden: isPlatformIntegrationSupported,
                  content: platformIntegrationTooltip,
                }}
                isDisabled={
                  !isPlatformIntegrationSupported && cluster?.platform?.type === 'baremetal'
                }
                name={'usePlatformIntegration'}
                label={<PlatformIntegrationLabel />}
              />
            </SplitItem>
          </Split>
        </StackItem>
      )}
      <StackItem>
        <SwitchField
          tooltipProps={{
            hidden: isSchedulableMastersEnabled,
            content: schedulableMastersTooltip,
          }}
          isDisabled={!isSchedulableMastersEnabled}
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
