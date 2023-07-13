import React from 'react';
import InfoLinkWithModal from '../ui/InfoLinkWithModal';
import { DiscoveryTroubleshootingModalContent } from '../../../common';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';

export interface HostsDiscoveryTroubleshootingInfoLinkWithModalProps {
  isInline?: boolean;
  isSingleNode?: boolean;
}

const HostsDiscoveryTroubleshootingInfoLinkWithModal = ({
  isInline = false,
  isSingleNode = false,
}: HostsDiscoveryTroubleshootingInfoLinkWithModalProps) => {
  const { t } = useTranslation();

  return (
    <InfoLinkWithModal
      linkText={t('ai:Host not showing up?', { count: isSingleNode ? 1 : 2 })}
      modalTitle={t('ai:Hosts not showing up troubleshooter')}
      modalVariant={'large'}
      isInline={isInline}
      linkId="link-host-troubleshooting"
      modalId="modal-host-troubleshooting"
    >
      <DiscoveryTroubleshootingModalContent />
    </InfoLinkWithModal>
  );
};

export default HostsDiscoveryTroubleshootingInfoLinkWithModal;
