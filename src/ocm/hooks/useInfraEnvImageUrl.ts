import React from 'react';
import useInfraEnvId from './useInfraEnvId';
import { Cluster } from '../../common';
import { InfraEnvsAPI } from '../services/apis';

export default function useInfraEnvImageUrl(clusterId: Cluster['id']) {
  const { infraEnvId } = useInfraEnvId(clusterId);

  const getImageUrl = React.useCallback(async (): Promise<string> => {
    try {
      if (!infraEnvId) {
        return '';
      }
      const {
        data: { url },
      } = await InfraEnvsAPI.getImageUrl(infraEnvId);
      if (!url) {
        throw 'Failed to retrieve the image URL, the API returned an invalid URL';
      }
      return url;
    } catch (e) {
      return '';
    }
  }, [infraEnvId]);

  return { getImageUrl };
}
