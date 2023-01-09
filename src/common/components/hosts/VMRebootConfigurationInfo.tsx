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
import { PrismCode } from '../../../common/components/ui';
import { useTranslation } from '../../hooks/use-translation-wrapper';

const Hint = () => {
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
      <Text component={TextVariants.p}>
        {t('ai:When using <code>virt-install</code>, please run:')}
      </Text>
      <PrismCode code="virt-install --wait -1 <rest of the command>" />
      <Text component={TextVariants.p}>
        {t('ai:Otherwise, the VMs will not be able to reboot during the installation process.')}
      </Text>
    </TextContent>
  );
};

const VMRebootConfigurationInfo = ({ isInline = false }: { isInline?: boolean }) => {
  const { t } = useTranslation();

  const popover = (
    <Popover bodyContent={<Hint />} minWidth="35rem">
      <Button variant={ButtonVariant.link} isInline>
        {!isInline && (
          <>
            <InfoCircleIcon size="sm" />
            &nbsp;
          </>
        )}
        {t('ai:Check your VM reboot configuration')}
      </Button>
    </Popover>
  );

  return isInline ? popover : <Text component="p">{popover}</Text>;
};

export default VMRebootConfigurationInfo;
