import { AxiosError, AxiosResponseHeaders } from 'axios';
import { EVENT_SEVERITIES, EventListFetchProps } from '../../../common';
import { handleApiError } from '../../api';
import { EventsAPI } from '../../services/apis';
import { SeverityCountsType } from '../../../common/components/ui/ClusterEventsToolbar';
import { Event } from '@openshift-assisted/types/assisted-installer-service';
const parseHeaders = (headers: AxiosResponseHeaders) => {
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
  return {
    totalEvents: Number(headers['event-count']),
    severities: severities as SeverityCountsType,
  };
};

const fetchEventsAsync = async (...args: Parameters<typeof onFetchEvents>): Promise<void> => {
  const [props, onSuccess, onError] = args;

  try {
    EventsAPI.abort();
    const response = await EventsAPI.list(props);
    onSuccess({
      data: response.data,
      ...parseHeaders(response.headers),
    });
  } catch (error) {
    const { code } = error as AxiosError;
    if (!code || code !== 'ERR_CANCELED') {
      handleApiError(error, () => {
        onError('Failed to load events');
      });
    }
  }
};

export const onFetchEvents: EventListFetchProps['onFetchEvents'] = (props, onSuccess, onError) => {
  void fetchEventsAsync(props, onSuccess, onError);
};
