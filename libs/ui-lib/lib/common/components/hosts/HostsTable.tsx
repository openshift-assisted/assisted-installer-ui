import * as React from 'react';
import { ConnectedIcon } from '@patternfly/react-icons/dist/js/icons/connected-icon';
import { Host } from '@openshift-assisted/types/assisted-installer-service';

import { useTranslation } from '../../hooks/use-translation-wrapper';
import { WithTestID } from '../../types';
import { EmptyState } from '../ui';
import { HostsNotShowingLink, HostsNotShowingLinkProps } from '../clusterConfiguration';
import { HostDetail } from './HostRowDetail';
import { usePagination } from './usePagination';
import { AITable, AITableProps, ExpandComponentProps } from './AITable';

const getHostId = (host: Host) => host.id;

type HostsTableEmptyStateProps = {
  setDiscoveryHintModalOpen?: HostsNotShowingLinkProps['setDiscoveryHintModalOpen'];
  isSNO?: boolean;
};

export const HostsTableEmptyState = ({
  setDiscoveryHintModalOpen,
  isSNO = false,
}: HostsTableEmptyStateProps) => {
  const { t } = useTranslation();
  return (
    <EmptyState
      icon={ConnectedIcon}
      title={t('ai:Waiting for host...', { count: +isSNO })}
      content={t('ai:Hosts may take a few minutes to appear here after booting.')}
      secondaryActions={
        setDiscoveryHintModalOpen && [
          <HostsNotShowingLink
            key="hosts-not-showing"
            isSNO={isSNO}
            setDiscoveryHintModalOpen={setDiscoveryHintModalOpen}
          />,
        ]
      }
    />
  );
};

export const DefaultExpandComponent = ({ obj }: ExpandComponentProps<Host>) => (
  <HostDetail key={obj.id} host={obj} />
);

type HostsTableProps = ReturnType<typeof usePagination> &
  Pick<
    AITableProps<Host>,
    | 'content'
    | 'actionResolver'
    | 'onSelect'
    | 'selectedIDs'
    | 'setSelectedIDs'
    | 'ExpandComponent'
    | 'className'
    | 'canSelectAll'
    | 'variant'
  > & {
    hosts: Host[];
    alreadySorted?: boolean;
    skipDisabled?: boolean;
    children: React.ReactNode;
  };

export const HostsTable = ({
  hosts,
  skipDisabled,
  alreadySorted,
  ...rest
}: HostsTableProps & WithTestID) => {
  const data = React.useMemo(() => {
    const filteredHosts = (hosts || []).filter(
      (host) => !skipDisabled || host.status !== 'disabled',
    );

    return alreadySorted
      ? filteredHosts
      : filteredHosts.sort((a, b) =>
          a.createdAt && b.createdAt && a.createdAt < b.createdAt ? -1 : 1,
        );
  }, [hosts, skipDisabled, alreadySorted]);

  return (
    <AITable<Host> getDataId={getHostId} data={data} alreadySorted={alreadySorted} {...rest} />
  );
};
