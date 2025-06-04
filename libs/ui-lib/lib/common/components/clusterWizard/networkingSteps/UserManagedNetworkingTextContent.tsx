import React from 'react';
import { List, ListItem, Content,  } from '@patternfly/react-core';
import { RenderIf, ExternalLink } from '../../ui';
import { getOpenShiftNetworkingDocsLink } from '../../../config';
import { useTranslation } from '../../../hooks/use-translation-wrapper';
import { Trans } from 'react-i18next';

export interface UserManagedNetworkingTextContentProps {
  shouldDisplayLoadBalancersBullet?: boolean;
  docVersion?: string;
}

export const UserManagedNetworkingTextContent = ({
  shouldDisplayLoadBalancersBullet = false,
  docVersion,
}: UserManagedNetworkingTextContentProps) => {
  const { t } = useTranslation();
  return (
    <Content>
      <Content component={'p'}>
        <Trans t={t}>
          ai:Please refer to the{' '}
          <ExternalLink href={getOpenShiftNetworkingDocsLink(docVersion)}>
            OpenShift networking documentation
          </ExternalLink>{' '}
          to configure your cluster's networking, including:
        </Trans>
      </Content>
      <List>
        <ListItem>{t('ai:DHCP or static IP Addresses')}</ListItem>
        <RenderIf condition={shouldDisplayLoadBalancersBullet}>
          <ListItem>{t('ai:Load balancers')}</ListItem>
        </RenderIf>
        <ListItem>{t('ai:Network ports')}</ListItem>
        <ListItem>{t('ai:DNS')}</ListItem>
      </List>
    </Content>
  );
};
