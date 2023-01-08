import React from 'react';
import { List, ListItem, Text, TextContent } from '@patternfly/react-core';
import { RenderIf, ExternalLink } from '../../ui';
import { OPENSHIFT_NETWORKING_DOCS_LINK } from '../../../config';
import { useTranslation } from '../../../hooks/use-translation-wrapper';
import { Trans } from 'react-i18next';

export interface UserManagedNetworkingTextContentProps {
  shouldDisplayLoadBalancersBullet?: boolean;
}

export const UserManagedNetworkingTextContent = ({
  shouldDisplayLoadBalancersBullet = false,
}: UserManagedNetworkingTextContentProps) => {
  const { t } = useTranslation();
  return (
    <TextContent>
      <Text component={'p'}>
        <Trans t={t}>
          ai:Please refer to the{' '}
          <ExternalLink href={OPENSHIFT_NETWORKING_DOCS_LINK}>
            OpenShift networking documentation
          </ExternalLink>{' '}
          to configure your cluster's networking, including:
        </Trans>
      </Text>
      <List>
        <ListItem>{t('ai:DHCP or static IP Addresses')}</ListItem>
        <RenderIf condition={shouldDisplayLoadBalancersBullet}>
          <ListItem>{t('ai:Load balancers')}</ListItem>
        </RenderIf>
        <ListItem>{t('ai:Network ports')}</ListItem>
        <ListItem>{t('ai:DNS')}</ListItem>
      </List>
    </TextContent>
  );
};
