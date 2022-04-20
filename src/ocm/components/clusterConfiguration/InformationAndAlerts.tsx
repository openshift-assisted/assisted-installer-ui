import React from 'react';
import { Text } from '@patternfly/react-core';
import {
  Cluster,
  HostsNotShowingLink,
  HostsNotShowingLinkProps,
  VMRebootConfigurationInfo,
  isSNO,
} from '../../../common';
import { HostRequirementsLink, HostRequirementsLinkProps } from '../fetching/HostRequirements';
import OCSDisksManualFormattingHint from '../hosts/OCSDisksManualFormattingHint';
import { isAddHostsCluster } from '../clusters/utils';
import { isAHostVM } from '../hosts/utils';
import InfoLinkWithModal from '../ui/InfoLinkWithModal';
import HostRequirementsContent from '../hosts/HostRequirementsContent';
import HostsDiscoveryTroubleshootingInfoLinkWithModal from '../hosts/HostsDiscoveryTroubleshootingInfoLinkWithModal';

const InformationAndAlerts: React.FC<{
  cluster: Cluster;
}> = ({ cluster }) => {
  const isVM = React.useMemo(() => isAHostVM(cluster.hosts || []), [cluster.hosts]);
  const isSNOCluster = isSNO(cluster);

  return (
    <>
      <Text component="h3">Information and warnings</Text>
      <Text component="p">
        <InfoLinkWithModal
          linkText={'Minimum hardware requirements'}
          modalTitle={'Minimum hardware requirements'}
        >
          <HostRequirementsContent
            clusterId={cluster.id}
            isSingleNode={isSNOCluster}
            isAddingHosts={isAddHostsCluster(cluster)}
          />
        </InfoLinkWithModal>
        &nbsp;
        <HostsDiscoveryTroubleshootingInfoLinkWithModal isSingleNode={isSNOCluster} />
      </Text>
      {isVM && <VMRebootConfigurationInfo />}
      {!isAddHostsCluster(cluster) && <OCSDisksManualFormattingHint />}
    </>
  );
};
export default InformationAndAlerts;
