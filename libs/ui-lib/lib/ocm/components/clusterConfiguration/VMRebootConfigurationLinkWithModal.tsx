import React from 'react';
import { VMRebootConfigurationContent, useTranslation } from '../../../common';
import { InfoLinkWithModal } from '../ui';

export const VMRebootConfigurationLinkWithModal = () => {
  const { t } = useTranslation();
  const title = t('ai:Check your VM reboot configuration');
  return (
    <InfoLinkWithModal
      linkText={title}
      modalTitle={title}
      modalVariant={'medium'}
      isInline
      linkId="check-reboot-configuration"
      modalId="check-reboot-configuration"
    >
      <VMRebootConfigurationContent />
    </InfoLinkWithModal>
  );
};
