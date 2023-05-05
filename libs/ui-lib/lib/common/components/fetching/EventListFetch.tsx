import React from 'react';
import { AxiosResponseHeaders } from 'axios';
import omit from 'lodash-es/omit.js';
import { Pagination, PaginationVariant } from '@patternfly/react-core';
import { Event, EventList } from '../../api';
import { EVENTS_POLLING_INTERVAL, EVENT_SEVERITIES } from '../../config';
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

export const EventListFetch = ({ onFetchEvents, ...props }: EventListFetchProps) => {
  const { cluster, hostId, className, entityKind } = props;

  const [lastPolling, setLastPolling] = useStateSafely(0);
  const [error, setError] = useStateSafely('');
  const [isLoading, setLoading] = useStateSafely(true);
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

  const parseHeaders = React.useCallback(
    (headers: AxiosResponseHeaders) => {
      const severities: Record<Event['severity'], number> = {
        error: 0,
        info: 0,
        warning: 0,
        critical: 0,
      };
      EVENT_SEVERITIES.forEach((severity) => {
        const count = Number(headers[`severity-count-${severity}`]);
        severities[severity] = count;
      });
      setTotalEvents(Number(headers['event-count']));
      setSeverityCount(severities as SeverityCountsType);
    },
    [setSeverityCount, setTotalEvents],
  );

  React.useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    setLoading(true);

    void onFetchEvents(
      {
        clusterId: cluster.id,
        ...omit(filters, 'selectAll'),
        offset: perPage * (pageNum - 1),
        limit: perPage,
      },
      ({ data: newEvents, headers }) => {
        setError('');
        setEvents(newEvents);
        setLoading(false);
        parseHeaders(headers);
        timer = setTimeout(() => setLastPolling(Date.now()), EVENTS_POLLING_INTERVAL);
      },
      setError,
    );

    return () => clearTimeout(timer);
  }, [
    lastPolling,
    cluster.id,
    hostId,
    onFetchEvents,
    perPage,
    pageNum,
    parseHeaders,
    filters,
    setLoading,
    setError,
    setEvents,
    setLastPolling,
  ]);

  const forceRefetch = React.useCallback(() => {
    setLastPolling(Date.now());
  }, [setLastPolling]);

  let eventList = (
    <EventsList
      events={events || []}
      className={className}
      resetFilters={() => setFilters(getInitialClusterEventsFilters(entityKind, hostId))}
    />
  );

  if (error) {
    eventList = <ErrorState title={error} fetchData={forceRefetch} />;
  }

  if (isLoading || !events) {
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
      {eventList}
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
    </>
  );
};
