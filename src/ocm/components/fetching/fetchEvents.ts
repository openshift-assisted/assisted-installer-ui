import { EventListFetchProps } from '../../../common';
import { handleApiError } from '../../api';
import { EventsAPI } from '../../services/apis';

export const onFetchEvents: EventListFetchProps['onFetchEvents'] = async (
  props,
  onSuccess,
  onError,
) => {
  try {
    const response = await EventsAPI.list(props);
    onSuccess(response);
  } catch (error) {
    handleApiError(error, () => {
      onError('Failed to load events');
    });
  }
};
