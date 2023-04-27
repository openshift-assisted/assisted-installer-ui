import React from 'react';
import InfoLinkWithModal from '../ui/InfoLinkWithModal';
import { VMRebootConfigurationContent } from '../../../common/components/hosts/VMRebootConfigurationInfo';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';

const VMRebootConfigurationLinkWithModal = () => {
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

export default VMRebootConfigurationLinkWithModal;
