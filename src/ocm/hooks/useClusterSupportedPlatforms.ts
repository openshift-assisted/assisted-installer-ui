import React from 'react';
import { AxiosError } from 'axios';
import useSWR from 'swr';
import { getApiErrorMessage, handleApiError } from '../api';
import { ClustersAPI } from '../services/apis';
import {
  PlatformType,
  POLLING_INTERVAL,
  SupportedPlatformIntegrations,
  useAlerts,
} from '../../common';
import { APIErrorMixin } from '../api/types';

export type PlatformIntegrationType = typeof SupportedPlatformIntegrations[number];
export type SupportedPlatformIntegrationType = 'no-active-integrations' | PlatformIntegrationType;

function getIntegrablePlatformIntegration(platform: PlatformType[]) {
  const platformsSet = Array.from(new Set(platform));
  if (platformsSet.length === 1) {
    const [exclusivelyAvailablePlatform] = platformsSet;
    return SupportedPlatformIntegrations.includes(exclusivelyAvailablePlatform)
      ? exclusivelyAvailablePlatform
      : undefined;
  }
  return undefined;
}

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

  const supportedPlatformIntegration =
    isLoading || !data ? undefined : getIntegrablePlatformIntegration(data);

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
          message: getApiErrorMessage(error),
        }),
      );
    }
  }, [error, addAlert, clusterId, alerts]);

  return {
    isPlatformIntegrationSupported: supportedPlatformIntegration !== undefined,
    supportedPlatformIntegration: supportedPlatformIntegration || 'no-active-integrations',
    isLoading,
    error,
  };
}
