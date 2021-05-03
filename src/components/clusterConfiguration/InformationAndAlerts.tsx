import React from 'react';
import { Text } from '@patternfly/react-core';
import { Cluster } from '../../api';
import { HostRequirementsLink, HostRequirementsLinkProps } from '../fetching/HostRequirements';
import VMRebootConfigurationInfo from '../hosts/VMRebootConfigurationInfo';
import { HostsNotShowingLink, HostsNotShowingLinkProps } from './DiscoveryTroubleshootingModal';
import FormatDiskWarning from './FormatDiskWarning';
import OCSDisksManualFormattingHint from '../hosts/OCSDisksManualFormattingHint';

const InformationAndAlerts: React.FC<{
  cluster: Cluster;
  HostRequirementsContent: HostRequirementsLinkProps['ContentComponent'];
  setDiscoveryHintModalOpen: HostsNotShowingLinkProps['setDiscoveryHintModalOpen'];
}> = ({ cluster, HostRequirementsContent, setDiscoveryHintModalOpen }) => (
  <>
    <Text component="h3">Information &amp; Warnings</Text>
    <Text component="p">
      <HostRequirementsLink clusterId={cluster.id} ContentComponent={HostRequirementsContent} />
      <HostsNotShowingLink setDiscoveryHintModalOpen={setDiscoveryHintModalOpen} />
    </Text>
    <VMRebootConfigurationInfo hosts={cluster.hosts || []} />
    <OCSDisksManualFormattingHint />
    <FormatDiskWarning />
  </>
);

export default InformationAndAlerts;
