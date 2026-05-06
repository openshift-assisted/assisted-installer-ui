import React from 'react';
import { Spinner } from '@patternfly/react-core';
import { ConnectedIcon } from '@patternfly/react-icons/dist/js/icons/connected-icon';
import EmptyState from '../../../common/components/ui/uiState/EmptyState';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';
import HostsDiscoveryTroubleshootingInfoLinkWithModal from './HostsDiscoveryTroubleshootingInfoLinkWithModal';

export interface HostsTableEmptyStateProps {
  isSingleNode?: boolean;
}

const HostsTableEmptyState = ({ isSingleNode = false }: HostsTableEmptyStateProps) => {
  const { t } = useTranslation();

  return (
    <EmptyState
      icon={ConnectedIcon}
      title={t('ai:Waiting for host...', { count: isSingleNode ? 1 : 2 })}
      content={t('ai:Hosts may take a few minutes to appear here after booting.')}
      primaryAction={<Spinner size="xl" />}
      secondaryActions={[
        <HostsDiscoveryTroubleshootingInfoLinkWithModal key={'hosts-not-showing'} />,
      ]}
    />
  );
};

export default HostsTableEmptyState;
