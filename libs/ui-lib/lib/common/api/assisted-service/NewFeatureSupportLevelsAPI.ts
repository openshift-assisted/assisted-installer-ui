import { clientWithoutCaseConverter } from '../../api/axiosClient';
import { ArchitectureSupportLevelMap, NewFeatureSupportLevelMap } from '../../components';

export interface ArchitecturesSupportsLevel {
  architectures: ArchitectureSupportLevelMap;
}

export interface FeaturesSupportsLevel {
  features: NewFeatureSupportLevelMap;
}

export const NewFeatureSupportLevelsAPI = {
  makeBaseURI() {
    return `/v2/support-levels`;
  },

  featuresSupportLevel(openshiftVersion: string, cpuArchitecture?: string, platformType?: string) {
    return clientWithoutCaseConverter.get<FeaturesSupportsLevel>(
      `${NewFeatureSupportLevelsAPI.makeBaseURI()}/features`,
      {
        params: {
          openshift_version: openshiftVersion,
          cpu_architecture: cpuArchitecture,
          platform_type: platformType,
          ...(platformType === 'external' ? { external_platform_name: 'oci' } : {}),
        },
      },
    );
  },

  architecturesSupportLevel(openshiftVersion: string) {
    let queryParams = '?';
    queryParams += openshiftVersion ? `openshift_version=${openshiftVersion}&` : '';
    return clientWithoutCaseConverter.get<ArchitecturesSupportsLevel>(
      `${NewFeatureSupportLevelsAPI.makeBaseURI()}/architectures${queryParams}`,
    );
  },
};
