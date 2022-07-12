import React from 'react';
import { TextListItem, OrderType, Text, TextContent, TextList } from '@patternfly/react-core';
import { useTranslation } from '../../hooks/use-translation-wrapper';

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
          {t('ai:Set the host to boot <b>only one time</b> from this device.', { count: +isSNO })}
        </TextListItem>
        <TextListItem>{t('ai:Discovered hosts will appear in the table.')}</TextListItem>
      </TextList>
    </TextContent>
  );
};

export default DiscoveryInstructions;
