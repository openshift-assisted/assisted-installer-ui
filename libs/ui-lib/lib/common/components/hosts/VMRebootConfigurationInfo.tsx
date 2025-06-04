import React from 'react';
import {
  Button,
  ButtonVariant,
  Popover,
  Content,
  ContentVariants,
} from '@patternfly/react-core';
import { InfoCircleIcon } from '@patternfly/react-icons/dist/js/icons/info-circle-icon';
import { Trans } from 'react-i18next';
import { PrismCode, UiIcon } from '../../../common/components/ui';
import { useTranslation } from '../../hooks/use-translation-wrapper';

export const VMRebootConfigurationContent = () => {
  const { t } = useTranslation();
  return (
    <Content>
      <Content component={ContentVariants.p}>
        {t(
          'ai:Your libvirt virtual machines should be configured to restart automatically after a reboot. You can check this by running:',
        )}
      </Content>
      <PrismCode code="virsh dumpxml <name> | grep on_reboot" />
      <Content component={ContentVariants.p}>{t('ai:And verify that this is the output:')}</Content>
      <PrismCode code="<on_reboot>restart</on_reboot>" />
      <Content component={ContentVariants.p}>
        {t('ai:If not, please start your VMs with the following configuration:')}
      </Content>
      <PrismCode code="--events on_reboot=restart" />
      <Trans
        t={t}
        components={{ code: <code /> }}
        i18nKey="ai:When using <code>{{executionCommand}}</code>, please run:"
        values={{ executionCommand: 'virt-install' }}
      />
      <PrismCode code="virt-install --wait -1 <rest of the command>" />
      <Content component={ContentVariants.p}>
        {t('ai:Otherwise, the VMs will not be able to reboot during the installation process.')}
      </Content>
    </Content>
  );
};

const VMRebootConfigurationInfo = () => {
  const { t } = useTranslation();

  return (
    <Content component="p">
      <Popover bodyContent={<VMRebootConfigurationContent />} minWidth="35rem">
        <Button variant={ButtonVariant.link} isInline>
          <>
            <UiIcon size="sm" icon={<InfoCircleIcon />} />
            &nbsp;
          </>
          {t('ai:Check your VM reboot configuration')}
        </Button>
      </Popover>
    </Content>
  );
};

export default VMRebootConfigurationInfo;
