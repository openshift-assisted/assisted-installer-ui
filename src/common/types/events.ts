import { AxiosResponse } from 'axios';
import { Cluster, Event, EventList, V2Events } from '../api';

export type EventsEntityKind = 'cluster' | 'host';

export type ClusterEventsFiltersType = {
  clusterLevel: boolean;
  deletedHosts: boolean;
  hostIds: V2Events['hostIds'];
  severities: V2Events['severities'];
  message: string;
};

export type EventFetchProps = {
  hostId: Event['hostId'];
  cluster: Cluster;
};

export type EventListFetchProps = EventFetchProps & {
  entityKind: EventsEntityKind;
  onFetchEvents: (
    params: V2Events,
    onSuccess: (data: AxiosResponse<EventList>) => void,
    onError: (message: string) => void,
  ) => Promise<void>;
  className?: string;
};
