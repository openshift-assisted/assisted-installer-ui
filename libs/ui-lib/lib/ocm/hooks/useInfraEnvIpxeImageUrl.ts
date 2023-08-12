import React from 'react';
import { CpuArchitecture } from '../../common';
import { InfraEnvsAPI } from '../services/apis';
import { getErrorMessage } from '../../common/utils';
import { InfraEnvsService } from '../services';
import { Cluster, PresignedUrl } from '@openshift-assisted/types/assisted-installer-service';

type ImgUrl = {
  url: PresignedUrl['url'];
  error: string;
};

export default function useInfraEnvIpxeImageUrl() {
  const getIpxeImageUrl = React.useCallback(
    async (clusterId: Cluster['id'], cpuArchitecture: CpuArchitecture): Promise<ImgUrl> => {
      try {
        const infraEnvId = await InfraEnvsService.getInfraEnvId(clusterId, cpuArchitecture);
        if (!infraEnvId || infraEnvId instanceof Error) {
          return { url: '', error: `Failed to retrieve the infraEnv for ${clusterId}` };
        }

        const {
          data: { url },
        } = await InfraEnvsAPI.getIpxeImageUrl(infraEnvId);
        return {
          url,
          error: url
            ? ''
            : 'Failed to retrieve the Ipxe image URL, the API returned an invalid URL',
        };
      } catch (e) {
        return { url: '', error: getErrorMessage(e) };
      }
    },
    [],
  );

  return { getIpxeImageUrl };
}
