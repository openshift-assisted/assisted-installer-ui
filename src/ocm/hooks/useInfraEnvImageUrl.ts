import React from 'react';
import useInfraEnvId from './useInfraEnvId';
import { Cluster, InfraEnvImageUrl } from '../../common';
import { APIErrorMixin } from '../api/types';
import { InfraEnvsAPI } from '../services/apis';

type errorType = (APIErrorMixin & Error) | string;

export default function useInfraEnvImageUrl(clusterId: Cluster['id']) {
  const { infraEnvId, error: infraEnvIdError } = useInfraEnvId(clusterId);
  const [imageUrl, setImageUrl] = React.useState<InfraEnvImageUrl['url']>();
  const [error, setError] = React.useState<errorType>();

  const getImageUrl = React.useCallback(async () => {
    try {
      if (!infraEnvId) {
        return;
      }
      const {
        data: { url },
      } = await InfraEnvsAPI.getImageUrl(infraEnvId);
      if (!url) {
        throw 'Failed to retrieve the image URL, the API returned an invalid URL';
      }
      setImageUrl(url);
    } catch (e) {
      setError(e as errorType);
    }
  }, [infraEnvId]);

  React.useEffect(() => {
    if (infraEnvIdError) {
      setError(infraEnvIdError);
    } else if (!imageUrl) {
      getImageUrl();
    }
  }, [imageUrl, getImageUrl, infraEnvId, infraEnvIdError]);

  return { imageUrl, error, isLoading: (!imageUrl || !infraEnvId) && !error };
}
