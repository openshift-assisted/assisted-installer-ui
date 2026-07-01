import React from 'react';
import { DiscoveryTroubleshootingModalContent, useTranslation } from '../../../common';
import { InfoLinkWithModal } from '../ui';

export interface HostsDiscoveryTroubleshootingInfoLinkWithModalProps {
  isInline?: boolean;
  isSingleNode?: boolean;
}

export const HostsDiscoveryTroubleshootingInfoLinkWithModal = ({
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
