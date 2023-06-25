import React from 'react';
import { ConnectedIcon } from '@patternfly/react-icons';
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
      secondaryActions={[
        <HostsDiscoveryTroubleshootingInfoLinkWithModal key={'hosts-not-showing'} />,
      ]}
    />
  );
};

export default HostsTableEmptyState;
