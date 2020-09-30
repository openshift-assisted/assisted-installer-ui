import React from 'react';
import { Text, TextContent, Button } from '@patternfly/react-core';
import HostsTable from '../hosts/HostsTable';
import { Cluster, HostRequirements } from '../../api/types';
import { DiscoveryImageModalButton } from './discoveryImageModal';
import {
  HostsNotShowingLink,
  DiscoveryTroubleshootingModal,
} from './DiscoveryTroubleshootingModal';
import { getHostRequirements } from '../../api/hostRequirements';
import { getErrorMessage, handleApiError } from '../../api';
import { addAlert } from '../../features/alerts/alertsSlice';

interface BareMetalInventoryProps {
  cluster: Cluster;
}

const BaremetalInventory: React.FC<BareMetalInventoryProps> = ({ cluster }) => {
  const [isDiscoveryHintModalOpen, setDiscoveryHintModalOpen] = React.useState(false);
  const [hostRequirements, setHostRequirements] = React.useState<HostRequirements | null>(null);

  React.useEffect(() => {
    const fetchFunc = async () => {
      try {
        const { data } = await getHostRequirements();
        setHostRequirements(data);
      } catch (e) {
        handleApiError(e, () =>
          addAlert({
            title: 'Failed to retrieve minimum host requierements',
            message: getErrorMessage(e),
          }),
        );
      }
    };
    fetchFunc();
  }, [setHostRequirements]);

  return (
    <>
      <TextContent>
        <Text component="h2">Bare Metal Inventory</Text>
        <Text component="p">
          <DiscoveryImageModalButton ButtonComponent={Button} cluster={cluster} />
        </Text>
        <Text component="p">
          Boot the Discovery ISO on hardware that should become part of this bare metal cluster.
          Hosts connected to the internet will be inspected and automatically appear below.{' '}
          <HostsNotShowingLink setDiscoveryHintModalOpen={setDiscoveryHintModalOpen} />
        </Text>
        {hostRequirements && (
          <Text component="p">
            Three master hosts are required with at least {hostRequirements.master?.cpuCores || 4}{' '}
            CPU cores, {hostRequirements.master?.ramGib || 16} GB of RAM, and{' '}
            {hostRequirements.master?.diskSizeGb || 120} GB of filesystem storage each. Two or more
            additional worker hosts are recommended with at least{' '}
            {hostRequirements.worker?.cpuCores || 2} CPU cores,{' '}
            {hostRequirements.worker?.ramGib || 8} GB of RAM, and{' '}
            {hostRequirements.worker?.diskSizeGb || 120}
            GB of filesystem storage each.
          </Text>
        )}
      </TextContent>
      <HostsTable cluster={cluster} setDiscoveryHintModalOpen={setDiscoveryHintModalOpen} />
      <DiscoveryTroubleshootingModal
        isOpen={isDiscoveryHintModalOpen}
        setDiscoveryHintModalOpen={setDiscoveryHintModalOpen}
      />
    </>
  );
};

export default BaremetalInventory;
