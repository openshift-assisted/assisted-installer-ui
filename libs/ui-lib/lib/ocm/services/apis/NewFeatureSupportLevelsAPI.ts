import { clientWithoutConverter } from '../../api/axiosClient';
import {
  ArchitecturesSupportsLevel,
  FeaturesSupportsLevel,
} from '../../components/newFeatureSupportLevels/types';

const NewFeatureSupportLevelsAPI = {
  makeBaseURI() {
    return `/v2/support-levels`;
  },

  featuresSupportLevel(openshiftVersion: string, cpuArchitecture?: string) {
    let queryParams = '?';
    queryParams += openshiftVersion ? `openshift_version=${openshiftVersion}&` : '';
    queryParams += cpuArchitecture ? `cpu_architecture=${cpuArchitecture}` : '';
    return clientWithoutConverter.get<FeaturesSupportsLevel>(
      `${NewFeatureSupportLevelsAPI.makeBaseURI()}/features${queryParams}`,
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
