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

  const filteredEvents = filterEvenets(filters, events);

  return (
    <>
      <ClusterEventsToolbar filters={filters} setFilters={setFilters} cluster={cluster} />
      {filteredEvents.length === 0 && events.length > 0 ? (
        <div>
          There are no events matching the requested criteria, try changing it to get results.
        </div>
      ) : (
        <EventsList events={filteredEvents} />
      )}
    </>
  );
};

export default ClusterEventsList;
