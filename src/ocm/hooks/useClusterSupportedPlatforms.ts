import React from 'react';
import { AxiosError } from 'axios';
import useSWR from 'swr';
import { getApiErrorMessage, handleApiError } from '../api';
import { ClustersAPI } from '../services/apis';
import { PlatformType, POLLING_INTERVAL, useAlerts } from '../../common';
import { APIErrorMixin } from '../api/types';

const platformsToIntegrate = ['vsphere', 'nutanix'] as const;
export type PlatformIntegrationType = typeof platformsToIntegrate[number];
export type SupportedPlatformIntegrationType = 'no-active-integrations' | PlatformIntegrationType;

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
    isLoading || !data ? undefined : getUniqueValuesFromData(data);

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
    supportedPlatformIntegration: supportedPlatformIntegration
      ? (supportedPlatformIntegration as SupportedPlatformIntegrationType)
      : 'no-active-integrations',
    isLoading,
    error,
  };
}

function getUniqueValuesFromData(data: PlatformType[] | undefined) {
  const setData = data ? new Set(data) : undefined;
  if (
    setData &&
    setData.size === 1 &&
    platformsToIntegrate.includes(setData.values().next().value as PlatformIntegrationType)
  ) {
    return setData.values().next().value as PlatformType;
  } else {
    return undefined;
  }
}
