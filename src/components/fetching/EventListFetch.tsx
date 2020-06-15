import React, { useEffect, useState } from 'react';
import EventsList from '../ui/EventsList';
import { EventList, Event } from '../../api/types';
import { getEvents } from '../../api/events';
import { EVENTS_POLLING_INTERVAL } from '../../config/constants';
import { ErrorState, LoadingState } from '../ui/uiState';

export type EventFetchProps = {
  entityId: Event['entityId'];
};

type EventListFetchProps = EventFetchProps & {
  entityKind: string;
};

const EventListFetch: React.FC<EventListFetchProps> = ({ entityId, entityKind }) => {
  const [events, setEvents] = useState<EventList>();
  const [lastPolling, setLastPolling] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    let timer: NodeJS.Timeout;
    const fetch = async () => {
      try {
        const { data } = await getEvents(entityId);
        setEvents(data);
        setError('');
      } catch (error) {
        console.warn(`Failed to load events for ${entityKind} ${entityId}: `, error);
        setError('Failed to load events');
      }
      timer = setTimeout(() => setLastPolling(Date.now()), EVENTS_POLLING_INTERVAL);
    };
    fetch();
    return () => clearTimeout(timer);
  }, [entityId, lastPolling, entityKind]);

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
