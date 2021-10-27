import { EventListFetchProps } from '../../../common';
import { handleApiError } from '../../api';
import { EventsAPI } from '../../services/apis';

interface EventAPIListOptions {
  clusterId?: string;
  hostId?: string;
  infraEnvId?: string;
  categories?: string[];
}

export const onFetchEvents: EventListFetchProps['onFetchEvents'] = async (
  props,
  onSuccess,
  onError,
) => {
  try {
    const options: EventAPIListOptions = props;
    const { data } = await EventsAPI.list(options);
    onSuccess(data);
  } catch (error) {
    handleApiError(error, () => {
      onError('Failed to load events');
    });
  }
};
