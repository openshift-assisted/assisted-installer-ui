import { clientWithoutConverter } from '../../api/axiosClient';
import {
  ArchitecturesSupportsLevel,
  FeaturesSupportsLevel,
} from '../../components/featureSupportLevels/types';

const FeatureSupportLevelsAPI = {
  makeBaseURI() {
    return `/v2/support-levels`;
  },

  featuresSupportLevel(openshiftVersion: string, cpuArchitecture?: string) {
    let queryParams = '?';
    queryParams += openshiftVersion ? `openshift_version=${openshiftVersion}&` : '';
    queryParams += cpuArchitecture ? `cpu_architecture=${cpuArchitecture}` : '';
    return clientWithoutConverter.get<FeaturesSupportsLevel>(
      `${FeatureSupportLevelsAPI.makeBaseURI()}/features${queryParams}`,
    );
  },

  architecturesSupportLevel(openshiftVersion: string) {
    let queryParams = '?';
    queryParams += openshiftVersion ? `openshift_version=${openshiftVersion}&` : '';
    return clientWithoutConverter.get<ArchitecturesSupportsLevel>(
      `${FeatureSupportLevelsAPI.makeBaseURI()}/architectures${queryParams}`,
    );
  },
};

export default FeatureSupportLevelsAPI;
