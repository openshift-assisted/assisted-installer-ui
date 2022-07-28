import React from 'react';
import useInfraEnvId from './useInfraEnvId';
import { Cluster, PresignedUrl } from '../../common';
import { InfraEnvsAPI } from '../services/apis';
import { getErrorMessage } from '../../common/utils';

type ImgUrl = {
  url: PresignedUrl['url'];
  error: string;
};

export default function useInfraEnvImageUrl(clusterId: Cluster['id']) {
  const { infraEnvId, error: infraEnvError } = useInfraEnvId(clusterId);

  const getImageUrl = React.useCallback(async (): Promise<ImgUrl> => {
    try {
      if (!infraEnvId) {
        return { url: '', error: infraEnvError || 'Missing infraEnv' };
      }
      const {
        data: { url },
      } = await InfraEnvsAPI.getImageUrl(infraEnvId);
      if (!url) {
        throw 'Failed to retrieve the image URL, the API returned an invalid URL';
      }
      return { url, error: '' };
    } catch (e) {
      return { url: '', error: getErrorMessage(e) };
    }
  }, [infraEnvError, infraEnvId]);

  return { getImageUrl };
}
