import React from 'react';
import { Text } from '@patternfly/react-core';
import { Cluster, VMRebootConfigurationInfo, isSNO, FormatDiskWarning } from '../../../common';
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
        <span className={'pf-u-mr-md'}>&nbsp;</span>
        <HostsDiscoveryTroubleshootingInfoLinkWithModal isSingleNode={isSNOCluster} />
      </Text>
      {isVM && <VMRebootConfigurationInfo />}
      {!isAddHostsCluster(cluster) && <OCSDisksManualFormattingHint />}
      <FormatDiskWarning />
    </>
  );
};
export default InformationAndAlerts;
