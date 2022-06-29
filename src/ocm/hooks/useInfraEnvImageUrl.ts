import React from 'react';
import useInfraEnvId from './useInfraEnvId';
import { Cluster, PresignedUrl } from '../../common';
import { InfraEnvsAPI } from '../services/apis';
import { getErrorMessage } from '../../common/utils';

export default function useInfraEnvImageUrl(clusterId: Cluster['id']) {
  const { infraEnvId, error: infraEnvIdError } = useInfraEnvId(clusterId);
  const [imageUrl, setImageUrl] = React.useState<PresignedUrl['url']>();
  const [error, setError] = React.useState('');

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
      setError(getErrorMessage(e));
    }
  }, [infraEnvId]);

  React.useEffect(() => {
    if (infraEnvIdError) {
      setError(infraEnvIdError);
    } else if (!imageUrl) {
      void getImageUrl();
    }
  }, [imageUrl, getImageUrl, infraEnvId, infraEnvIdError]);

  return { imageUrl, error, isLoading: (!imageUrl || !infraEnvId) && !error };
}
