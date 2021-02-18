import React from 'react';
import { Text, TextContent, Button, Stack, StackItem } from '@patternfly/react-core';
import { Cluster, HostRequirements as HostRequirementsType } from '../../api/types';
import { HostRequirementsLink } from '../fetching/HostRequirements';
import VMRebootConfigurationInfo from '../hosts/VMRebootConfigurationInfo';
import { DiscoveryImageModalButton } from './discoveryImageModal';
import {
  HostsNotShowingLink,
  DiscoveryTroubleshootingModal,
} from './DiscoveryTroubleshootingModal';
import FormatDiskWarning from './FormatDiskWarning';
import { isSingleNodeCluster } from './utils';
import BaremetalDiscoveryHostsTable from '../hosts/BaremetalDiscoveryHostsTable';

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

// const OCSLabel: React.FC = () => (
//   <>
//     Install OpenShift Container Storage
//     {/* TODO(mlibra): List of OCS requierements is stabilizing now - https://issues.redhat.com/browse/MGMT-4220 )
//     <PopoverIcon headerContent="Additional Requirements" bodyContent={<>FOO BAR </>} />*/}
//   </>
// );

const BaremetalInventory: React.FC<{ cluster: Cluster }> = ({ cluster }) => {
  const [isDiscoveryHintModalOpen, setDiscoveryHintModalOpen] = React.useState(false);
  // const isOpenshiftClusterStorageEnabled = useFeature('ASSISTED_INSTALLER_OCS_FEATURE');

  return (
    <Stack hasGutter>
      <StackItem>
        <TextContent>
          <Text component="h2">Bare Metal Discovery</Text>
        </TextContent>
      </StackItem>
      <StackItem>
        <TextContent>
          <Text component="p">
            Generate a Discovery ISO and boot it from a USB key, hard drive, or over a network on
            hardware that should become part of this bare metal cluster.
          </Text>
          <Text component="p">
            <DiscoveryImageModalButton
              ButtonComponent={Button}
              cluster={cluster}
              idPrefix="bare-metal-inventory"
            />
          </Text>
          <Text component="p">
            Hosts connected to the internet with a valid IP address will appear bellow. Each host
            should be configured to boot the ISO <b>once</b> and not after a reboot.
          </Text>
          {/* TODO(jtomasek): Turn baremetal inventory into a form and enable this field */}
          {/* {isOpenshiftClusterStorageEnabled && (
            <CheckboxField
              name="useExtraDisksForLocalStorage"
              label={<OCSLabel />}
              helperText="Persistent software-defined storage for hybrid applications."
            />
          )}
          <Text /> */}
          <Text component="p">
            {isSingleNodeCluster(cluster) ? (
              <HostRequirementsLink ContentComponent={SingleHostRequirementsContent} />
            ) : (
              <HostRequirementsLink ContentComponent={HostRequirementsContent} />
            )}
            <HostsNotShowingLink setDiscoveryHintModalOpen={setDiscoveryHintModalOpen} />
          </Text>
          <FormatDiskWarning />
          <VMRebootConfigurationInfo hosts={cluster.hosts} />
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
