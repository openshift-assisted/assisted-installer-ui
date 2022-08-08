import React from 'react';
import { Text } from '@patternfly/react-core';
import {
  Cluster,
  VMRebootConfigurationInfo,
  isSNO,
  FormatDiskWarning,
  hasODFOperators,
} from '../../../common';
import OCSDisksManualFormattingHint from '../hosts/OCSDisksManualFormattingHint';
import { isAddHostsCluster } from '../clusters/utils';
import { isAHostVM } from '../hosts/utils';
import InfoLinkWithModal from '../ui/InfoLinkWithModal';
import HostRequirementsContent from '../hosts/HostRequirementsContent';
import HostsDiscoveryTroubleshootingInfoLinkWithModal from '../hosts/HostsDiscoveryTroubleshootingInfoLinkWithModal';

const InformationAndAlerts = ({ cluster }: { cluster: Cluster }) => {
  const isVM = React.useMemo(() => isAHostVM(cluster.hosts || []), [cluster.hosts]);
  const isSNOCluster = isSNO(cluster);
  const showFormattingHint = hasODFOperators(cluster) && !isAddHostsCluster(cluster);

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
      {showFormattingHint && <OCSDisksManualFormattingHint />}
      <FormatDiskWarning />
    </>
  );
};
export default InformationAndAlerts;
