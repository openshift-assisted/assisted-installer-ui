import React from 'react';
import { Text } from '@patternfly/react-core';
import {
  Cluster,
  HostsNotShowingLink,
  HostsNotShowingLinkProps,
  VMRebootConfigurationInfo,
  FormatDiskWarning,
} from '../../../common';
import { HostRequirementsLink, HostRequirementsLinkProps } from '../fetching/HostRequirements';
import OCSDisksManualFormattingHint from '../hosts/OCSDisksManualFormattingHint';
import { isAddHostsCluster } from '../clusters/utils';
import { isAHostVM } from '../hosts/utils';

const InformationAndAlerts: React.FC<{
  cluster: Cluster;
  HostRequirementsContent: HostRequirementsLinkProps['ContentComponent'];
  setDiscoveryHintModalOpen: HostsNotShowingLinkProps['setDiscoveryHintModalOpen'];
}> = ({ cluster, HostRequirementsContent, setDiscoveryHintModalOpen }) => {
  const isVM = React.useMemo(() => isAHostVM(cluster.hosts || []), [cluster.hosts]);

  return (
    <>
      <Text component="h3">Information and warnings</Text>
      <Text component="p">
        <HostRequirementsLink clusterId={cluster.id} ContentComponent={HostRequirementsContent} />
        <HostsNotShowingLink setDiscoveryHintModalOpen={setDiscoveryHintModalOpen} />
      </Text>
      {isVM && <VMRebootConfigurationInfo />}
      {!isAddHostsCluster(cluster) && <OCSDisksManualFormattingHint />}
      <FormatDiskWarning />
    </>
  );
};
export default InformationAndAlerts;
