import useSWR from 'swr';
import { getErrorMessage, handleApiError } from '../api';
import { ClustersAPI } from '../services/apis';
import { PlatformType, POLLING_INTERVAL, useAlerts } from '../../common';
import { AxiosError } from 'axios';
import { APIErrorMixin } from '../api/types';

export default function useClusterSupportedPlatforms(clusterId: string) {
  const { addAlert } = useAlerts();
  const url = ClustersAPI.makeSupportedPlatformsBaseURI(clusterId);
  const fetcher = () => ClustersAPI.getSupportedPlatforms(clusterId).then((res) => res.data);
  const { data, error } = useSWR<PlatformType[], AxiosError<APIErrorMixin>>(url, fetcher, {
    refreshInterval: POLLING_INTERVAL,
  });

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
