import useSWR from 'swr';
import { client } from '../axiosClient';
import { alertsSlice, PlatformType, POLLING_INTERVAL } from '../../../common';
import { getErrorMessage, handleApiError } from '../utils';

const fetcher = (url: string) => client.get(url).then((res) => res.data);

const useClusterSupportedPlatforms = (clusterId: string) => {
  const { data, error } = useSWR<PlatformType[]>(
    `/v2/clusters/${clusterId}/supported-platforms`,
    fetcher,
    { refreshInterval: POLLING_INTERVAL },
  );

  if (error) {
    handleApiError(error, () =>
      alertsSlice.actions.addAlert({
        title: `Failed to retrieve supported platforms (clusterId: ${clusterId})`,
        message: getErrorMessage(error),
      }),
    );
  }

  const isLoading = !error && !data;
  /**
   * Platform integration is supported if there is another platform type, besides 'baremetal', in the returned data.
   */
  const isPlatformIntegrationSupported =
    (data?.filter((platform) => platform !== 'baremetal') || [])?.length > 0;

  return {
    isPlatformIntegrationSupported,
    isLoading,
    error,
  };
};

export default useClusterSupportedPlatforms;
