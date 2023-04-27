import React from 'react';
import { Alert, AlertVariant } from '@patternfly/react-core';
import { Cluster, isSNO } from '../../../common';
import { isAHostVM } from '../hosts/utils';
import { isAddHostsCluster } from '../clusters/utils';
import HostRequirementsContent from '../hosts/HostRequirementsContent';
import HostsDiscoveryTroubleshootingInfoLinkWithModal from '../hosts/HostsDiscoveryTroubleshootingInfoLinkWithModal';
import VMRebootConfigurationLinkWithModal from '../hosts/VMRebootConfigurationLinkWithModal';
import InfoLinkWithModal from '../ui/InfoLinkWithModal';

const InformationAndAlerts = ({ cluster }: { cluster: Cluster }) => {
  const isVM = React.useMemo(() => isAHostVM(cluster.hosts || []), [cluster.hosts]);
  const isSNOCluster = isSNO(cluster);

  return (
    <Alert
      title={'Information & Troubleshooting'}
      data-testid="alert-information-troubleshooting"
      variant={AlertVariant.info}
      isInline
      actionLinks={
        <>
          <InfoLinkWithModal
            linkText={'Minimum hardware requirements'}
            modalTitle={'Minimum hardware requirements'}
            linkId="alert-information-troubleshooting__link-hwrequirements"
            modalId="alert-information-troubleshooting__modal-hwrequirements"
            isInline
          >
            <HostRequirementsContent
              clusterId={cluster.id}
              isSingleNode={isSNOCluster}
              isAddingHosts={isAddHostsCluster(cluster)}
            />
          </InfoLinkWithModal>
          <HostsDiscoveryTroubleshootingInfoLinkWithModal isSingleNode={isSNOCluster} isInline />
          {isVM && <VMRebootConfigurationLinkWithModal />}
        </>
      }
    />
  );
};
export default InformationAndAlerts;
