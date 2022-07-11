import React from 'react';
import { Button, ButtonVariant } from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons';
import { Cluster, EventList } from '../../api';
import { ClusterEventsFiltersType } from '../../types';
import { EmptyState } from './uiState';
import EventsList from './EventsList';
import ClusterEventsToolbar, { getInitialClusterEventsFilters } from './ClusterEventsToolbar';
import { useTranslation } from '../../hooks/use-translation-wrapper';

export type ClusterEventsListProps = {
  events: EventList;
  cluster: Cluster;
  className?: string;
};

const filterEvents = (
  filters: ClusterEventsFiltersType,
  events: EventList = [],
  clusterHosts: Cluster['hosts'],
) => {
  return events
    .filter((event) => filters.severity.length === 0 || filters.severity.includes(event.severity))
    .filter(
      (event) =>
        !event.hostId ||
        filters.hosts.includes(event.hostId) ||
        (filters.orphanedHosts && !(clusterHosts || []).find((host) => host.id === event.hostId)),
    )
    .filter((event) => event.hostId || filters.clusterLevel)
    .filter(
      (event) =>
        !filters.fulltext ||
        (event.message || '').toLowerCase().includes(filters.fulltext.toLowerCase()),
    );
};

const ClusterEventsList: React.FC<ClusterEventsListProps> = ({ events, cluster, className }) => {
  const [filters, setFilters] = React.useState<ClusterEventsFiltersType>(() =>
    getInitialClusterEventsFilters(cluster),
  );

  const filteredEvents = React.useMemo(
    () => filterEvents(filters, events, cluster.hosts),
    [filters, events, cluster.hosts],
  );
  const { t } = useTranslation();
  return (
    <>
      <ClusterEventsToolbar
        filters={filters}
        setFilters={setFilters}
        cluster={cluster}
        events={events}
      />
      {filteredEvents.length === 0 && events.length > 0 ? (
        <EmptyState
          icon={SearchIcon}
          title={t('ai:No matching events')}
          content={t(
            'ai:There are no events that match the current filters. Adjust or clear the filters to view events.',
          )}
          primaryAction={
            <Button
              variant={ButtonVariant.primary}
              onClick={() => setFilters(getInitialClusterEventsFilters(cluster))}
              id="empty-state-cluster-events-clear-filters-button"
              data-ouia-id="button-clear-events-filter"
            >
              {t('ai:Clear filters')}
            </Button>
          }
        />
      ) : (
        <EventsList events={filteredEvents} className={className} />
      )}
    </>
  );
};

export default ClusterEventsList;
