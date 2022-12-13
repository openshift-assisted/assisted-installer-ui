import React from 'react';
import { TextListItem, OrderType, Text, TextContent, TextList } from '@patternfly/react-core';
import { useTranslation } from '../../hooks/use-translation-wrapper';

const DiscoveryIpxeInstructions = () => {
  const { t } = useTranslation();
  return (
    <TextContent>
      <Text component="h3">{t('ai:Adding hosts instructions')}</Text>
      <TextList component="ol" type={OrderType.number} style={{ marginLeft: 0 }}>
        <TextListItem>{t('ai:Download the example iPXE script file')}</TextListItem>
        <TextListItem>
          {t('ai:Download the assets in the script file to your iPXE server')}
        </TextListItem>
        <TextListItem>
          {t(
            'ai:Inside the example script file, customize the asset URLs to your local server address',
          )}
        </TextListItem>
        <TextListItem>{t('ai:Set all the hosts to boot using iPXE script file')}</TextListItem>
      </TextList>
    </TextContent>
  );
};

export default DiscoveryIpxeInstructions;
