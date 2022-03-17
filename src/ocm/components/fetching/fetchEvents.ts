import { EventListFetchProps } from '../../../common';
import { handleApiError } from '../../api';
import { EventsAPI } from '../../services/apis';
import InfraEnvsService from '../../services/InfraEnvsService';

export const onFetchEvents: EventListFetchProps['onFetchEvents'] = async (
  props,
  onSuccess,
  onError,
) => {
  try {
    const { data: eventList } = await EventsAPI.list(props);

    if (!props.hostId) {
      const infraEnvId = await InfraEnvsService.getInfraEnvId(props.clusterId);
      const { data } = await EventsAPI.list({ infraEnvId: infraEnvId });

      eventList.push(
        ...data.filter(
          (event) =>
            !eventList.find((e) => e.eventTime + e.message === event.eventTime + e.message),
        ),
      );
    }

    onSuccess(eventList);
  } catch (error) {
    handleApiError(error, () => {
      onError('Failed to load events');
    });
  }
};
