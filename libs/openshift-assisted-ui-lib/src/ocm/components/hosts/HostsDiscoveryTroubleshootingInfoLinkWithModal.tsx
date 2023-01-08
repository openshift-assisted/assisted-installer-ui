import React from 'react';
import InfoLinkWithModal from '../ui/InfoLinkWithModal';
import { pluralize } from 'humanize-plus';
import { DiscoveryTroubleshootingModalContent } from '../../../common';

export interface HostsDiscoveryTroubleshootingInfoLinkWithModalProps {
  isInline?: boolean;
  isSingleNode?: boolean;
}

const HostsDiscoveryTroubleshootingInfoLinkWithModal = ({
  isInline = false,
  isSingleNode = false,
}: HostsDiscoveryTroubleshootingInfoLinkWithModalProps) => {
  return (
    <InfoLinkWithModal
      linkText={`${pluralize(+isSingleNode, 'Host')} not showing up?`}
      modalTitle={'Troubleshooting Host Discovery Issues'}
      modalVariant={'large'}
      isInline={isInline}
    >
      <DiscoveryTroubleshootingModalContent />
    </InfoLinkWithModal>
  );
};

export default HostsDiscoveryTroubleshootingInfoLinkWithModal;
