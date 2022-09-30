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

export type PlatformIntegrationType = 'vsphere' | 'nutanix';
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
    isLoading || !data
      ? undefined
      : data.find((platform) => SupportedPlatformIntegrations.includes(platform));

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
    supportedPlatformIntegration: supportedPlatformIntegration as SupportedPlatformIntegrationType,
    isLoading,
    error,
  };
}
