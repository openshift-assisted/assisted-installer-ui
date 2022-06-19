import React from 'react';
import { ConnectedIcon } from '@patternfly/react-icons';
import { pluralize } from 'humanize-plus';
import EmptyState from '../../../common/components/ui/uiState/EmptyState';
import HostsDiscoveryTroubleshootingInfoLinkWithModal from './HostsDiscoveryTroubleshootingInfoLinkWithModal';

export interface HostsTableEmptyStateProps {
  isSingleNode?: boolean;
}

const HostsTableEmptyState = ({ isSingleNode = false }: HostsTableEmptyStateProps) => {
  return (
    <EmptyState
      icon={ConnectedIcon}
      title={`Waiting for ${pluralize(+isSingleNode, 'host')}...`}
      content="Hosts may take a few minutes to appear here after booting."
      secondaryActions={[
        <HostsDiscoveryTroubleshootingInfoLinkWithModal key={'hosts-not-showing'} />,
      ]}
    />
  );
};

export default HostsTableEmptyState;
