import React from 'react';
import { Text, TextContent, Button } from '@patternfly/react-core';
import HostsTable from '../hosts/HostsTable';
import { DiscoveryImageModalButton } from '../clusterConfiguration/discoveryImageModal';
import { DiscoveryTroubleshootingModal } from '../clusterConfiguration/DiscoveryTroubleshootingModal';
import InformationAndAlerts from '../clusterConfiguration/InformationAndAlerts';
import DiscoveryInstructions from '../clusterConfiguration/DiscoveryInstructions';
import { fileSize } from '../hosts/utils';
import { AddHostsContext } from './AddHostsContext';
import { useClusterPreflightRequirementsContext } from '../clusterConfiguration/ClusterPreflightRequirementsContext';

const HostRequirementsContent = () => {
  const { preflightRequirements } = useClusterPreflightRequirementsContext();

  const worker = preflightRequirements?.ocp?.worker?.quantitative;
  const workerRam = fileSize((worker?.ramMib || 8 * 1024) * 1024 * 1024, 2, 'iec');

  return (
    <Text component="p">
      Worker hosts must have at least {worker?.cpuCores || 2} CPU cores, {workerRam} of RAM, and{' '}
      {worker?.diskSizeGb || 120} GB of filesystem storage.
    </Text>
  );
};

const InventoryAddHosts: React.FC = () => {
  const { cluster } = React.useContext(AddHostsContext);
  const [isDiscoveryHintModalOpen, setDiscoveryHintModalOpen] = React.useState(false);

  if (!cluster) {
    return null;
  }

  return (
    <>
      <TextContent>
        <DiscoveryInstructions />
        <Text component="p">
          <DiscoveryImageModalButton
            ButtonComponent={Button}
            cluster={cluster}
            idPrefix="bare-metal-inventory-add-host"
          />
        </Text>
        <InformationAndAlerts
          cluster={cluster}
          HostRequirementsContent={HostRequirementsContent}
          setDiscoveryHintModalOpen={setDiscoveryHintModalOpen}
        />
      </TextContent>
      <HostsTable cluster={cluster} setDiscoveryHintModalOpen={setDiscoveryHintModalOpen} />
      <DiscoveryTroubleshootingModal
        isOpen={isDiscoveryHintModalOpen}
        setDiscoveryHintModalOpen={setDiscoveryHintModalOpen}
      />
    </>
  );
};

export default InventoryAddHosts;
