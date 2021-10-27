import { EventListFetchProps } from '../../../common';
import { handleApiError } from '../../api';
import { ClustersAPI, HostsAPI } from '../../services/apis';

export const onFetchEvents: EventListFetchProps['onFetchEvents'] = async (
  props,
  onSuccess,
  onError,
) => {
  try {
    if (props.hostId) {
      const { data } = await HostsAPI.events(props.hostId);
      onSuccess(data);
    } else {
      const { data } = await ClustersAPI.events(props.clusterId);
      onSuccess(data);
    }
  } catch (error) {
    handleApiError(error, () => {
      onError('Failed to load events');
    });
  }
};
