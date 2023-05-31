import React from 'react';
import omit from 'lodash-es/omit.js';
import { Pagination, PaginationVariant } from '@patternfly/react-core';
import { EventList } from '../../api';
import { EVENTS_POLLING_INTERVAL } from '../../config';
import { ClusterEventsFiltersType, EventListFetchProps } from '../../types';
import { useStateSafely } from '../../hooks';
import { ErrorState, LoadingState } from '../ui/uiState';
import EventsList from '../ui/EventsList';
import ClusterEventsToolbar, {
  getInitialClusterEventsFilters,
  SeverityCountsType,
} from '../ui/ClusterEventsToolbar';

const initialSeverityCounts = {
  critical: 0,
  error: 0,
  info: 0,
  warning: 0,
};

export const EventListFetch = ({
  onFetchEvents,
  disablePagination,
  ...props
}: EventListFetchProps) => {
  const { cluster, hostId, className, entityKind, setLoading } = props;

  const [lastPolling, setLastPolling] = useStateSafely(0);
  const [error, setError] = useStateSafely('');
  const [events, setEvents] = useStateSafely<EventList | undefined>(undefined);

  const [pageNum, setPageNum] = useStateSafely(1);
  const [perPage, setPerPage] = useStateSafely(10);
  const [totalEvents, setTotalEvents] = useStateSafely<number | undefined>(undefined);
  const [filters, setFilters] = useStateSafely<ClusterEventsFiltersType>(
    getInitialClusterEventsFilters(entityKind, hostId),
  );
  const [severityCounts, setSeverityCount] =
    useStateSafely<SeverityCountsType>(initialSeverityCounts);

  const onSetPage = (
    _event: React.MouseEvent | React.KeyboardEvent | MouseEvent,
    newPage: number,
  ) => {
    setPageNum(newPage);
  };

  const onPerPageSelect = (
    _event: React.MouseEvent | React.KeyboardEvent | MouseEvent,
    newPerPage: number,
    newPage: number,
  ) => {
    setPerPage(newPerPage);
    setPageNum(newPage);
  };

  React.useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    setLoading(true);

    onFetchEvents(
      {
        clusterId: cluster.id,
        ...omit(filters, 'selectAll'),
        offset: perPage * (pageNum - 1),
        limit: perPage,
      },
      ({ data: newEvents, severities, totalEvents }) => {
        setError('');
        setEvents(newEvents);
        setLoading(false);
        setTotalEvents(totalEvents);
        setSeverityCount(severities);
        timer = setTimeout(() => setLastPolling(Date.now()), EVENTS_POLLING_INTERVAL);
      },
      (err: string) => {
        setError(err);
        setLoading(false);
      },
    );

    return () => clearTimeout(timer);
  }, [
    lastPolling,
    cluster.id,
    hostId,
    onFetchEvents,
    perPage,
    pageNum,
    filters,
    setLoading,
    setError,
    setEvents,
    setLastPolling,
    setTotalEvents,
    setSeverityCount,
  ]);

  const forceRefetch = React.useCallback(() => {
    setLastPolling(Date.now());
  }, [setLastPolling]);

  let eventList = (
    <EventsList
      events={events || []}
      resetFilters={() => setFilters(getInitialClusterEventsFilters(entityKind, hostId))}
    />
  );

  if (error) {
    eventList = <ErrorState title={error} fetchData={forceRefetch} />;
  }

  if (!events) {
    eventList = <LoadingState />;
  }

  return (
    <>
      <ClusterEventsToolbar
        filters={filters}
        setFilters={(filters) => {
          setFilters(filters);
          setPageNum(1);
        }}
        cluster={cluster}
        hostId={hostId}
        entityKind={entityKind}
        events={events || []}
        severityCounts={severityCounts}
      />
      <div className={className}>{eventList}</div>
      {!disablePagination && (
        <Pagination
          perPageComponent="button"
          itemCount={totalEvents}
          widgetId="events-pagination"
          perPage={perPage}
          page={pageNum}
          variant={PaginationVariant.bottom}
          onSetPage={onSetPage}
          onPerPageSelect={onPerPageSelect}
        />
      )}
    </>
  );
};
