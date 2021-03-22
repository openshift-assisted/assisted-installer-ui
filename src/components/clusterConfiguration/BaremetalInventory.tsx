import React from 'react';
import { Text, TextContent, Button, Stack, StackItem } from '@patternfly/react-core';
import { Cluster, HostRequirements as HostRequirementsType } from '../../api/types';
import { DiscoveryImageModalButton } from './discoveryImageModal';
import { DiscoveryTroubleshootingModal } from './DiscoveryTroubleshootingModal';
import BaremetalDiscoveryHostsTable from '../hosts/BaremetalDiscoveryHostsTable';
import { useFeature } from '../../features/featureGate';
import CheckboxField from '../ui/formik/CheckboxField';
import { isSingleNodeCluster } from '../clusters/utils';
import InformationAndAlerts from './InformationAndAlerts';
import DiscoveryInstructions from './DiscoveryInstructions';

const HostRequirementsContent = ({
  worker = {},
  master = {},
}: {
  worker?: HostRequirementsType['worker'];
  master?: HostRequirementsType['master'];
}) => (
  <Text component="p">
    Three master hosts are required with at least {master.cpuCores || 4} CPU cores,{' '}
    {master.ramGib || 16} GiB of RAM, and {master.diskSizeGb || 120} GB of filesystem storage each.
    Two or more additional worker hosts are recommended with at least {worker.cpuCores || 2} CPU
    cores, {worker.ramGib || 8} GiB of RAM, and {worker.diskSizeGb || 120} GB of filesystem storage
    each.
  </Text>
);

const SingleHostRequirementsContent = ({
  master = {},
}: {
  master?: HostRequirementsType['master'];
}) => (
  <Text component="p">
    One host is required with at least {master.cpuCores || 4} CPU cores, {master.ramGib || 16} GiB
    of RAM, and {master.diskSizeGb || 120} GB of filesystem storage.
  </Text>
);

const OCSLabel: React.FC = () => (
  <>
    Install OpenShift Container Storage
    {/* TODO(mlibra): List of OCS requierements is stabilizing now - https://issues.redhat.com/browse/MGMT-4220 )
    <PopoverIcon headerContent="Additional Requirements" bodyContent={<>FOO BAR </>} />*/}
  </>
);

const BaremetalInventory: React.FC<{ cluster: Cluster }> = ({ cluster }) => {
  const [isDiscoveryHintModalOpen, setDiscoveryHintModalOpen] = React.useState(false);
  const isOpenshiftClusterStorageEnabled = useFeature('ASSISTED_INSTALLER_OCS_FEATURE');

  return (
    <Stack hasGutter>
      <StackItem>
        <TextContent>
          <Text component="h2">Bare Metal Discovery</Text>
        </TextContent>
      </StackItem>
      <StackItem>
        <TextContent>
          <DiscoveryInstructions />
          <Text component="p">
            <DiscoveryImageModalButton
              ButtonComponent={Button}
              cluster={cluster}
              idPrefix="bare-metal-inventory"
            />
          </Text>
          {isOpenshiftClusterStorageEnabled && (
            <CheckboxField
              name="useExtraDisksForLocalStorage"
              label={<OCSLabel />}
              helperText="Persistent software-defined storage for hybrid applications."
            />
          )}
          <InformationAndAlerts
            cluster={cluster}
            HostRequirementsContent={
              isSingleNodeCluster(cluster) ? SingleHostRequirementsContent : HostRequirementsContent
            }
            setDiscoveryHintModalOpen={setDiscoveryHintModalOpen}
          />
        </TextContent>
        <BaremetalDiscoveryHostsTable
          cluster={cluster}
          setDiscoveryHintModalOpen={setDiscoveryHintModalOpen}
        />
        <DiscoveryTroubleshootingModal
          isOpen={isDiscoveryHintModalOpen}
          setDiscoveryHintModalOpen={setDiscoveryHintModalOpen}
        />
      </StackItem>
    </Stack>
  );
};

export default BaremetalInventory;
