import React from 'react';
import { Event, EventList } from '../../api';
import { EVENTS_POLLING_INTERVAL, EVENT_SEVERITIES } from '../../config';
import { ClusterEventsFiltersType, EventListFetchProps } from '../../types';

// avoid circular dep
import { ErrorState, LoadingState } from '../ui/uiState';
import EventsList from '../ui/EventsList';
import { Pagination, PaginationVariant } from '@patternfly/react-core';
import ClusterEventsToolbar, {
  getInitialClusterEventsFilters,
  SeverityCountsType,
} from '../ui/ClusterEventsToolbar';
import { AxiosResponseHeaders } from 'axios';
import omit from 'lodash-es/omit.js';

const initialSeverityCounts = {
  critical: 0,
  error: 0,
  info: 0,
  warning: 0,
};

export const EventListFetch = ({ onFetchEvents, ...props }: EventListFetchProps) => {
  const { cluster, hostId, className, entityKind } = props;

  const [lastPolling, setLastPolling] = React.useState(0);
  const [error, setError] = React.useState('');
  const [isLoading, setLoading] = React.useState(true);
  const [events, setEvents] = React.useState<EventList>();

  const [pageNum, setPageNum] = React.useState(1);
  const [perPage, setPerPage] = React.useState(10);
  const [totalEvents, setTotalEvents] = React.useState<number>();
  const [filters, setFilters] = React.useState<ClusterEventsFiltersType>(() =>
    getInitialClusterEventsFilters(entityKind, hostId),
  );
  const [severityCounts, setSeverityCount] =
    React.useState<SeverityCountsType>(initialSeverityCounts);

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

  const parseHeaders = React.useCallback((headers: AxiosResponseHeaders) => {
    let total = 0;
    const severities: Record<Event['severity'], number> = {
      error: 0,
      info: 0,
      warning: 0,
      critical: 0,
    };
    EVENT_SEVERITIES.forEach((severity) => {
      const count = Number(headers[`severity-count-${severity}`]);
      severities[severity] = count;
      total += count;
    });
    setTotalEvents(total);
    setSeverityCount(severities as SeverityCountsType);
  }, []);

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
    totalEvents,
    filters,
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
