import React from 'react';
import { Content, OrderType, } from '@patternfly/react-core';
import { useTranslation } from '../../hooks/use-translation-wrapper';

const DiscoveryIpxeInstructions = () => {
  const { t } = useTranslation();
  return (
    <Content>
      <Content component="h3">{t('ai:Adding hosts instructions')}</Content>
      <Content component="ol" type={OrderType.number} style={{ marginLeft: 0 }}>
        <Content component="li">{t('ai:Download the example iPXE script file')}</Content>
        <Content component="li">
          {t('ai:Download the assets in the script file to your iPXE server')}
        </Content>
        <Content component="li">
          {t(
            'ai:Inside the example script file, customize the asset URLs to your local server address',
          )}
        </Content>
        <Content component="li">{t('ai:Set all the hosts to boot using iPXE script file')}</Content>
      </Content>
    </Content>
  );
};

export default DiscoveryIpxeInstructions;
