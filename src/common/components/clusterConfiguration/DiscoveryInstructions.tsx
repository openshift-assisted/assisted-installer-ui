import React from 'react';
import { TextListItem, OrderType, Text, TextContent, TextList } from '@patternfly/react-core';
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
    <TextContent>
      <Text component="h3">{t('ai:Adding hosts instructions')}</Text>
      <TextList component="ol" type={OrderType.number} style={{ marginLeft: 0 }}>
        <TextListItem hidden={!showAllInstructions}>
          {t('ai:Click the Add host button.', { count: +isSNO })}
        </TextListItem>
        <TextListItem hidden={!showAllInstructions}>
          {t('ai:Configure the SSH key and proxy settings after the modal appears (optional).')}
        </TextListItem>
        <TextListItem>
          {t(
            'ai:Download the Discovery ISO (onto a USB drive, attach it to a virtual media, etc.) and use it to boot your hosts.',
          )}
        </TextListItem>
        <TextListItem>
          <Trans
            t={t}
            count={+isSNO}
            components={{ bold: <strong /> }}
            i18nKey="ai:Keep the Discovery ISO media connected to the device throughout the installation process and set each host to boot <bold>only one time</bold> from this device. "
          />
        </TextListItem>
        <TextListItem>
          {t(
            'ai:Booted hosts should appear in the host inventory table. This may take a few minutes.',
          )}
        </TextListItem>
      </TextList>
    </TextContent>
  );
};

export default DiscoveryInstructions;
