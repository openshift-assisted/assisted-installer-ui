import React from 'react';
import { TextListItem, OrderType, Text, TextContent, TextList } from '@patternfly/react-core';
import { useTranslation } from '../../hooks/use-translation-wrapper';

type DiscoveryIpxeInstructionsProps = {
  showAllInstructions?: boolean;
};

const DiscoveryIpxeInstructions = ({
  showAllInstructions = true,
}: DiscoveryIpxeInstructionsProps) => {
  const { t } = useTranslation();
  return (
    <TextContent>
      <Text component="h3">{t('ai:Adding hosts instructions')}</Text>
      <TextList component="ol" type={OrderType.number} style={{ marginLeft: 0 }}>
        <TextListItem hidden={!showAllInstructions}>
          {t('ai:Download script and place it on your iPXE server')}
        </TextListItem>
        <TextListItem hidden={!showAllInstructions}>
          {t('ai:Inside the script file, customize the server URL to your local server address')}
        </TextListItem>
        <TextListItem>{t('ai:Set all hosts to boot from the iPXE server URL')}</TextListItem>
      </TextList>
    </TextContent>
  );
};

export default DiscoveryIpxeInstructions;
