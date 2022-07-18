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
            'ai:Download the Discovery ISO and save it on a bootable device (local disk, USB drive, etc.).',
          )}
        </TextListItem>
        <TextListItem>
          <Trans
            t={t}
            count={+isSNO}
            components={{ bold: <strong /> }}
            i18nKey="ai:Set the host to boot <bold>only one time</bold> from this device."
          ></Trans>
        </TextListItem>
        <TextListItem>{t('ai:Discovered hosts will appear in the table.')}</TextListItem>
      </TextList>
    </TextContent>
  );
};

export default DiscoveryInstructions;
