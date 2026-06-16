import React from 'react';
import { Cluster, PresignedUrl } from '@openshift-assisted/types/assisted-installer-service';
import { CpuArchitecture, getErrorMessage } from '../../common';
import { InfraEnvsService } from '../services';
import { InfraEnvsAPI } from '../services/apis';

type ImgUrl = {
  url: PresignedUrl['url'];
  error: string;
};

export const useInfraEnvImageUrl = () => {
  const getIsoImageUrl = React.useCallback(
    async (clusterId: Cluster['id'], cpuArchitecture: CpuArchitecture): Promise<ImgUrl> => {
      try {
        const infraEnvId = await InfraEnvsService.getInfraEnvId(clusterId, cpuArchitecture);
        if (!infraEnvId || infraEnvId instanceof Error) {
          return { url: '', error: `Failed to retrieve the infraEnv for ${clusterId}` };
        }

        const {
          data: { url },
        } = await InfraEnvsAPI.getImageUrl(infraEnvId);
        return {
          url,
          error: url ? '' : 'Failed to retrieve the image URL, the API returned an invalid URL',
        };
      } catch (e) {
        return { url: '', error: getErrorMessage(e) };
      }
    },
    [],
  );

  return { getIsoImageUrl };
};
