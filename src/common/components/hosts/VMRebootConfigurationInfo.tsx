import React from 'react';
import {
  Button,
  ButtonVariant,
  Popover,
  Text,
  TextContent,
  TextVariants,
} from '@patternfly/react-core';
import { InfoCircleIcon } from '@patternfly/react-icons';
import { Trans } from 'react-i18next';
import { PrismCode } from '../../../common/components/ui';
import { useTranslation } from '../../hooks/use-translation-wrapper';

export const VMRebootConfigurationContent = () => {
  const { t } = useTranslation();
  return (
    <TextContent>
      <Text component={TextVariants.p}>
        {t(
          'ai:Your libvirt virtual machines should be configured to restart automatically after a reboot. You can check this by running:',
        )}
      </Text>
      <PrismCode code="virsh dumpxml <name> | grep on_reboot" />
      <Text component={TextVariants.p}>{t('ai:And verify that this is the output:')}</Text>
      <PrismCode code="<on_reboot>restart</on_reboot>" />
      <Text component={TextVariants.p}>
        {t('ai:If not, please start your VMs with the following configuration:')}
      </Text>
      <PrismCode code="--events on_reboot=restart" />
      <Trans
        t={t}
        components={{ code: <code /> }}
        i18nKey="ai:When using <code>{{executionCommand}}</code>, please run:"
        values={{ executionCommand: 'virt-install' }}
      />
      <PrismCode code="virt-install --wait -1 <rest of the command>" />
      <Text component={TextVariants.p}>
        {t('ai:Otherwise, the VMs will not be able to reboot during the installation process.')}
      </Text>
    </TextContent>
  );
};

const VMRebootConfigurationInfo = () => {
  const { t } = useTranslation();

  return (
    <Text component="p">
      <Popover bodyContent={<VMRebootConfigurationContent />} minWidth="35rem">
        <Button variant={ButtonVariant.link} isInline>
          <>
            <InfoCircleIcon size="sm" />
            &nbsp;
          </>
          {t('ai:Check your VM reboot configuration')}
        </Button>
      </Popover>
    </Text>
  );
};

export default VMRebootConfigurationInfo;
