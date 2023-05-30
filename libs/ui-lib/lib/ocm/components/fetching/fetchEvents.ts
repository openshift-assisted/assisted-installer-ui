import { AxiosError, AxiosResponseHeaders } from 'axios';
import { EVENT_SEVERITIES, Event, EventListFetchProps } from '../../../common';
import { handleApiError } from '../../api';
import { EventsAPI } from '../../services/apis';
import { SeverityCountsType } from '../../../common/components/ui/ClusterEventsToolbar';

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

export const onFetchEvents: EventListFetchProps['onFetchEvents'] = async (
  props,
  onSuccess,
  onError,
) => {
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
