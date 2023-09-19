import { clientWithoutConverter } from '../../api/axiosClient';
import {
  ArchitecturesSupportsLevel,
  FeaturesSupportsLevel,
} from '../../components/featureSupportLevels/types';

const NewFeatureSupportLevelsAPI = {
  makeBaseURI() {
    return `/v2/support-levels`;
  },

  featuresSupportLevel(openshiftVersion: string, cpuArchitecture?: string, platformType?: string) {
    return clientWithoutConverter.get<FeaturesSupportsLevel>(
      `${NewFeatureSupportLevelsAPI.makeBaseURI()}/features`,
      {
        params: {
          openshift_version: openshiftVersion,
          cpu_architecture: cpuArchitecture,
          platform_type: platformType,
        },
      },
    );
  },

  architecturesSupportLevel(openshiftVersion: string) {
    let queryParams = '?';
    queryParams += openshiftVersion ? `openshift_version=${openshiftVersion}&` : '';
    return clientWithoutConverter.get<ArchitecturesSupportsLevel>(
      `${NewFeatureSupportLevelsAPI.makeBaseURI()}/architectures${queryParams}`,
    );
  },
};

export default NewFeatureSupportLevelsAPI;
