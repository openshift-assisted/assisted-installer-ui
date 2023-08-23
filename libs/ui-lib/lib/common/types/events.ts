import {
  Cluster,
  Event,
  EventList,
  V2Events,
} from '@openshift-assisted/types/assisted-installer-service';

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

type OnSuccessResponse = {
  data: EventList;
  totalEvents: number;
  severities: Record<Event['severity'], number>;
};

export type EventListFetchProps = EventFetchProps & {
  entityKind: EventsEntityKind;
  onFetchEvents: (
    params: V2Events,
    onSuccess: (response: OnSuccessResponse) => void,
    onError: (message: string) => void,
  ) => void;
  className?: string;
  setLoading: (loading: boolean) => void;
  disablePagination?: boolean;
};
