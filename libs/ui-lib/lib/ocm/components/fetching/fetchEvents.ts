import { AxiosError } from 'axios';
import { EventListFetchProps } from '../../../common';
import { handleApiError } from '../../api';
import { EventsAPI } from '../../services/apis';

export const onFetchEvents: EventListFetchProps['onFetchEvents'] = async (
  props,
  onSuccess,
  onError,
) => {
  try {
    EventsAPI.abort();
    const response = await EventsAPI.list(props);
    onSuccess(response);
  } catch (error) {
    const { code } = error as AxiosError;
    if (!code || code !== 'ERR_CANCELED') {
      handleApiError(error, () => {
        onError('Failed to load events');
      });
    }
  }
};
