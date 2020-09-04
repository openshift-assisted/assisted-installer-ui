import React from 'react';
import EventsList from './EventsList';
import { EventList, Cluster } from '../../api/types';
import ClusterEventsToolbar, {
  ClusterEventsFiltersType,
  getInitialClusterEventsFilters,
} from './ClusterEventsToolbar';

type ClusterEventsListProps = {
  events: EventList;
  cluster: Cluster;
};

const filterEvenets = (filters: ClusterEventsFiltersType, events: EventList = []) => {
  return events
    .filter((event) => filters.severity.includes(event.severity))
    .filter((event) => filters.hosts.includes(event.hostId || ''))
    .filter(
      (event) =>
        !filters.fulltext ||
        (event.message || '').toLowerCase().includes(filters.fulltext.toLowerCase()),
    );
};

const ClusterEventsList: React.FC<ClusterEventsListProps> = ({ events, cluster }) => {
  const [filters, setFilters] = React.useState<ClusterEventsFiltersType>(() =>
    getInitialClusterEventsFilters(cluster),
  );

  return (
    <>
      <ClusterEventsToolbar filters={filters} setFilters={setFilters} cluster={cluster} />
      <EventsList events={filterEvenets(filters, events)} />
    </>
  );
};

export default ClusterEventsList;
