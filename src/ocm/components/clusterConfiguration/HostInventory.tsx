import React from 'react';
import { Text, TextContent, Button, Stack, StackItem } from '@patternfly/react-core';
import {
  Cluster,
  PopoverIcon,
  useFeature,
  isSingleNodeCluster,
  ClusterWizardStepHeader,
  DiscoveryTroubleshootingModal,
  DiscoveryInstructions,
  SwitchField,
  schedulableMastersAlwaysOn,
  HostDiscoveryValues,
  getSchedulableMasters,
} from '../../../common';
import HostsDiscoveryTable from '../hosts/HostsDiscoveryTable';
import { DiscoveryImageModalButton } from './discoveryImageModal';
import InformationAndAlerts from './InformationAndAlerts';
import {
  HostRequirementsContent,
  SingleHostRequirementsContent,
} from '../hosts/HostRequirementsContent';
import ClusterWizardHeaderExtraActions from './ClusterWizardHeaderExtraActions';
import { useClusterSupportedPlatforms } from '../../hooks';
import { useFormikContext } from 'formik';
import { OcsCheckbox } from './OcsCheckbox';
import { CnvCheckbox } from './CnvCheckbox';

const PlatformIntegrationLabel: React.FC = () => (
  <>
    <span>Integrate with platform</span>{' '}
    <PopoverIcon
      variant={'plain'}
      bodyContent={
        <p>
          Enable platform integration to access your platform's features directly in OpenShift.
          <br />
          <strong>Note:</strong> You will need to modify your platform configuration after cluster
          installation is completed.
        </p>
      }
    />
  </>
);

const SchedulableMastersLabel: React.FC = () => (
  <>
    <span>Run workloads on control plane nodes</span>{' '}
    <PopoverIcon
      variant={'plain'}
      bodyContent={<p>Enables your control plane nodes to be used for running applications.</p>}
    />
  </>
);

const platformIntegrationTooltip =
  'Platform integration is applicable only when all discovered hosts are from the same platform';
const schedulableMastersTooltip =
  'This toggle will be "On" and not editable when less than 5 hosts were discovered';

const HostInventory: React.FC<{ cluster: Cluster }> = ({ cluster }) => {
  const [isDiscoveryHintModalOpen, setDiscoveryHintModalOpen] = React.useState(false);
  const { isPlatformIntegrationSupported } = useClusterSupportedPlatforms(cluster.id);
  const isPlatformIntegrationFeatureEnabled = useFeature(
    'ASSISTED_INSTALLER_PLATFORM_INTEGRATION_FEATURE',
  );
  const isOpenshiftClusterStorageEnabled = useFeature('ASSISTED_INSTALLER_OCS_FEATURE');
  const isContainerNativeVirtualizationEnabled = useFeature('ASSISTED_INSTALLER_CNV_FEATURE');
  const isSNO = isSingleNodeCluster(cluster);
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
        <DiscoveryInstructions showAllInstructions />
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
            isSNO={isSNO}
            openshiftVersion={cluster.openshiftVersion}
          />
        </StackItem>
      )}
      {isOpenshiftClusterStorageEnabled && !isSNO && (
        <StackItem>
          <OcsCheckbox openshiftVersion={cluster.openshiftVersion} />
        </StackItem>
      )}
      {isPlatformIntegrationFeatureEnabled && (
        <StackItem>
          <SwitchField
            tooltipProps={{
              hidden: isPlatformIntegrationSupported,
              content: platformIntegrationTooltip,
            }}
            isDisabled={!isPlatformIntegrationSupported && cluster?.platform?.type === 'baremetal'}
            name={'usePlatformIntegration'}
            label={<PlatformIntegrationLabel />}
          />
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
          <InformationAndAlerts
            cluster={cluster}
            HostRequirementsContent={
              isSNO ? SingleHostRequirementsContent : HostRequirementsContent
            }
            setDiscoveryHintModalOpen={setDiscoveryHintModalOpen}
          />
        </TextContent>
      </StackItem>
      <StackItem>
        <HostsDiscoveryTable
          cluster={cluster}
          setDiscoveryHintModalOpen={setDiscoveryHintModalOpen}
        />
      </StackItem>
      <DiscoveryTroubleshootingModal
        isOpen={isDiscoveryHintModalOpen}
        setDiscoveryHintModalOpen={setDiscoveryHintModalOpen}
      />
    </Stack>
  );
};
export default HostInventory;
