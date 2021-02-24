import React from 'react';
import { Text, TextContent, Button } from '@patternfly/react-core';
import HostsTable from '../hosts/HostsTable';
import { HostRequirements as HostRequirementsType } from '../../api/types';
import HostRequirements from '../fetching/HostRequirements';
import { DiscoveryImageModalButton } from '../clusterConfiguration/discoveryImageModal';
import {
  DiscoveryTroubleshootingModal,
  HostsNotShowingLink,
} from '../clusterConfiguration/DiscoveryTroubleshootingModal';
import FormatDiskWarning from '../clusterConfiguration/FormatDiskWarning';
import VMRebootConfigurationInfo from '../hosts/VMRebootConfigurationInfo';
import { AddBareMetalHostsContext } from './AddBareMetalHostsContext';

const HostRequirementsContent = ({ worker = {} }: { worker?: HostRequirementsType['worker'] }) => (
  <Text component="p">
    Worker hosts must have at least {worker.cpuCores || 2} CPU cores, {worker.ramGib || 8} GiB of
    RAM, and {worker.diskSizeGb || 120} GB of filesystem storage.
  </Text>
);

const BaremetalInventoryAddHosts: React.FC = () => {
  const { cluster } = React.useContext(AddBareMetalHostsContext);
  const [isDiscoveryHintModalOpen, setDiscoveryHintModalOpen] = React.useState(false);

  if (!cluster) {
    return null;
  }

  return (
    <>
      <TextContent>
        <Text component="p">
          <DiscoveryImageModalButton
            ButtonComponent={Button}
            cluster={cluster}
            idPrefix="bare-metal-inventory-add-host"
          />
        </Text>
        <Text component="p">
          Boot the Discovery ISO on hardware that should become part of this bare metal cluster.
          Hosts connected to the internet will be inspected and automatically appear below.{' '}
          <HostsNotShowingLink setDiscoveryHintModalOpen={setDiscoveryHintModalOpen} />
        </Text>
        <HostRequirements ContentComponent={HostRequirementsContent} />
        <FormatDiskWarning />
        <VMRebootConfigurationInfo hosts={cluster.hosts} />
      </TextContent>
      <HostsTable cluster={cluster} setDiscoveryHintModalOpen={setDiscoveryHintModalOpen} />
      <DiscoveryTroubleshootingModal
        isOpen={isDiscoveryHintModalOpen}
        setDiscoveryHintModalOpen={setDiscoveryHintModalOpen}
      />
    </>
  );
};

export default BaremetalInventoryAddHosts;
