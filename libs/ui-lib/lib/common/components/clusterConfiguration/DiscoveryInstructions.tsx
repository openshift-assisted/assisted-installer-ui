import React from 'react';
import { Content, OrderType, } from '@patternfly/react-core';
import { useTranslation } from '../../hooks/use-translation-wrapper';
import { Trans } from 'react-i18next';

type DiscoveryInstructionsProps = {
  showAllInstructions?: boolean;
  isSNO?: boolean;
};

const DiscoveryInstructions = ({
  showAllInstructions = false,
  isSNO = false,
}: DiscoveryInstructionsProps) => {
  const { t } = useTranslation();
  return (
    <Content>
      <Content component="h3">{t('ai:Adding hosts instructions')}</Content>
      <Content component="ol" type={OrderType.number} style={{ marginLeft: 0 }}>
        <Content component="li" hidden={!showAllInstructions}>
          {t('ai:Click the Add host button.', { count: +isSNO })}
        </Content>
        <Content component="li" hidden={!showAllInstructions}>
          {t('ai:Configure the SSH key and proxy settings after the modal appears (optional).')}
        </Content>
        <Content component="li">
          {t(
            'ai:Download the Discovery ISO (onto a USB drive, attach it to a virtual media, etc.) and use it to boot your hosts.',
          )}
        </Content>
        <Content component="li">
          <Trans
            t={t}
            count={+isSNO}
            components={{ bold: <strong /> }}
            i18nKey="ai:Keep the Discovery ISO media connected to the device throughout the installation process and set each host to boot <bold>only one time</bold> from this device. "
          />
        </Content>
        <Content component="li">
          {t(
            'ai:Booted hosts should appear in the host inventory table. This may take a few minutes.',
          )}
        </Content>
      </Content>
    </Content>
  );
};

export default DiscoveryInstructions;
