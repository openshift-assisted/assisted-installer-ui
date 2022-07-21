import * as React from 'react';
import { getErrorMessage } from '../../../../common/utils';
import { ClusterImageSetK8sResource, ConfigMapK8sResource } from '../../../types';
import { getOCPVersions } from '../../helpers';

export const getSupportedCM = (configMaps: ConfigMapK8sResource[]) =>
  configMaps.find(
    (cm) => cm.metadata?.labels?.['hypershift.openshift.io/supported-versions'] === 'true',
  );

export const useSupportedOCPVersions = (
  clusterImages: ClusterImageSetK8sResource[],
  supportedVersionsCM?: ConfigMapK8sResource,
) => {
  return React.useMemo(() => {
    const ocpVersions = getOCPVersions(clusterImages);
    if (supportedVersionsCM?.data?.versions) {
      try {
        const supportedVersions = JSON.parse(supportedVersionsCM.data.versions) as string[];
        return ocpVersions.filter((v) => supportedVersions.find((sv) => v.version.startsWith(sv)));
      } catch (err) {
        console.error('Could not parse supported versions config map value.', getErrorMessage(err));
      }
    }
    return ocpVersions;
  }, [clusterImages, supportedVersionsCM]);
};
