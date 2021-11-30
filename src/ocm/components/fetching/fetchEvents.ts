import { EventListFetchProps } from '../../../common';
import { handleApiError } from '../../api';
import { EventsAPI } from '../../services/apis';

export const onFetchEvents: EventListFetchProps['onFetchEvents'] = async (
  props,
  onSuccess,
  onError,
) => {
  try {
    const { data } = await EventsAPI.list(props);
    onSuccess(data);
  } catch (error) {
    handleApiError(error, () => {
      onError('Failed to load events');
    });
  }
};
