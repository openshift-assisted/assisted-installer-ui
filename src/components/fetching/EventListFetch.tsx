import React, { useEffect, useState } from 'react';
import EventsList from '../ui/EventsList';
import { EventList, Event } from '../../api/types';
import { getEvents } from '../../api/clusters';
import { EVENTS_POLLING_INTERVAL } from '../../config/constants';
import { ErrorState, LoadingState } from '../ui/uiState';

export type EventFetchProps = {
  hostId: Event['hostId'];
  clusterId: Event['clusterId'];
};

type EventListFetchProps = EventFetchProps & {
  entityKind: string;
};

const EventListFetch: React.FC<EventListFetchProps> = ({ clusterId, hostId, entityKind }) => {
  const [events, setEvents] = useState<EventList>();
  const [lastPolling, setLastPolling] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    let timer: NodeJS.Timeout;
    const fetch = async () => {
      try {
        const { data } = await getEvents(clusterId, hostId);
        setEvents(data);
        setError('');
      } catch (error) {
        console.warn(`Failed to load events for ${entityKind} ${hostId || clusterId}: `, error);
        setError('Failed to load events');
      }
      timer = setTimeout(() => setLastPolling(Date.now()), EVENTS_POLLING_INTERVAL);
    };
    fetch();
    return () => clearTimeout(timer);
  }, [clusterId, hostId, lastPolling, entityKind]);

  const forceRefetch = React.useCallback(() => {
    setLastPolling(Date.now());
  }, [setLastPolling]);

  if (error) {
    return <ErrorState title={error} fetchData={forceRefetch} />;
  }

  if (!events) {
    return <LoadingState />;
  }

  return <EventsList events={events} />;
};

export default EventListFetch;
