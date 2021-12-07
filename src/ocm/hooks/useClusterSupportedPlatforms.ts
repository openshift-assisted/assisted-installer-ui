import useSWR from 'swr';
import { getErrorMessage, handleApiError } from '../api';
import { ClustersAPI } from '../services/apis';
import { PlatformType, POLLING_INTERVAL, useAlerts } from '../../common';
import { AxiosError } from 'axios';
import { APIErrorMixin } from '../api/types';
import React from 'react';
export default function useClusterSupportedPlatforms(clusterId: string) {
  const { addAlert, alerts } = useAlerts();
  const url = ClustersAPI.makeSupportedPlatformsBaseURI(clusterId);
  const fetcher = () => ClustersAPI.getSupportedPlatforms(clusterId).then((res) => res.data);
  const { data, error } = useSWR<PlatformType[], AxiosError<APIErrorMixin>>(url, fetcher, {
    refreshInterval: POLLING_INTERVAL,
    errorRetryCount: 0,
    revalidateOnFocus: false,
  });

  const isLoading = !error && !data;
  // Platform integration is supported
  // if there is another platform type
  // besides 'baremetal', in the returned data.
  const isPlatformIntegrationSupported =
    !isLoading && (data?.filter((platform) => platform !== 'baremetal') || [])?.length > 0;

  React.useEffect(() => {
    if (error) {
      const title = `Failed to retrieve supported platforms (clusterId: ${clusterId})`;
      //TODO(brotman) add handling of existing errors to alerts context
      if (alerts.find((alert) => alert.title === title)) {
        return;
      }
      handleApiError(error, () =>
        addAlert({
          title,
          message: getErrorMessage(error),
        }),
      );
    }
  }, [error, addAlert, clusterId, alerts]);

  return {
    isPlatformIntegrationSupported,
    isLoading,
    error,
  };
}
