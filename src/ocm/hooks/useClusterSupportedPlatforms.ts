import useSWR from 'swr';
import { client, getErrorMessage, handleApiError } from '../api';
import { ClustersAPI } from '../services/apis';
import { PlatformType, POLLING_INTERVAL, useAlerts } from '../../common';
import { AxiosError } from 'axios';
import { APIErrorMixin } from '../api/types';

const fetcher = (url: string) => client.get<PlatformType[]>(url).then((res) => res.data);

export default function useClusterSupportedPlatforms(clusterId: string) {
  const { addAlert } = useAlerts();
  const { data, error } = useSWR<PlatformType[], AxiosError<APIErrorMixin>>(
    `${ClustersAPI.getBaseURI(clusterId)}/supported-platforms`,
    fetcher,
    {
      refreshInterval: POLLING_INTERVAL,
    },
  );

  if (error) {
    handleApiError(error, () =>
      addAlert({
        title: `Failed to retrieve supported platforms (clusterId: ${clusterId})`,
        message: getErrorMessage(error),
      }),
    );
  }

  const isLoading = !error && !data;
  // Platform integration is supported
  // if there is another platform type
  // besides 'baremetal', in the returned data.
  const isPlatformIntegrationSupported =
    !isLoading && (data?.filter((platform) => platform !== 'baremetal') || [])?.length > 0;

  return {
    isPlatformIntegrationSupported,
    isLoading,
    error,
  };
}
