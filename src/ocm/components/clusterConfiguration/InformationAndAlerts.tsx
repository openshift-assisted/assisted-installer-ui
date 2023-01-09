import React from 'react';
import { Alert, AlertVariant } from '@patternfly/react-core';
import { Cluster, isSNO, VMRebootConfigurationInfo } from '../../../common';
import { isAHostVM } from '../hosts/utils';
import HostsDiscoveryTroubleshootingInfoLinkWithModal from '../hosts/HostsDiscoveryTroubleshootingInfoLinkWithModal';
import { isAddHostsCluster } from '../clusters/utils';
import HostRequirementsContent from '../hosts/HostRequirementsContent';
import InfoLinkWithModal from '../ui/InfoLinkWithModal';

const InformationAndAlerts = ({ cluster }: { cluster: Cluster }) => {
  const isVM = React.useMemo(() => isAHostVM(cluster.hosts || []), [cluster.hosts]);
  const isSNOCluster = isSNO(cluster);

  return (
    <Alert
      title={'Information & Troubleshooting'}
      variant={AlertVariant.info}
      isInline
      actionLinks={
        <>
          <InfoLinkWithModal
            linkText={'Minimum hardware requirements'}
            modalTitle={'Minimum hardware requirements'}
            isInline
          >
            <HostRequirementsContent
              clusterId={cluster.id}
              isSingleNode={isSNOCluster}
              isAddingHosts={isAddHostsCluster(cluster)}
            />
          </InfoLinkWithModal>
          <HostsDiscoveryTroubleshootingInfoLinkWithModal isSingleNode={isSNOCluster} isInline />
          {isVM && <VMRebootConfigurationInfo isInline />}
        </>
      }
    />
  );
};
export default InformationAndAlerts;
