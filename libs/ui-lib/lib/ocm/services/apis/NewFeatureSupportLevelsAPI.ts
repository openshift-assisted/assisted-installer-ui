import { clientWithoutConverter } from '../../api/axiosClient';
import {
  ArchitecturesSupportsLevel,
  FeaturesSupportsLevel,
} from '../../components/newFeatureSupportLevels/types';
import { getCpuArchitecture } from '../CpuArchitectureService';

const NewFeatureSupportLevelsAPI = {
  makeBaseURI() {
    return `/v2/support-levels`;
  },

  featuresSupportLevel(openshiftVersion: string, cpuArchitecture?: string, isOcm?: boolean) {
    const cpuArch = getCpuArchitecture(cpuArchitecture, isOcm);
    let queryParams = '?';
    queryParams += openshiftVersion ? `openshift_version=${openshiftVersion}&` : '';
    queryParams += cpuArchitecture ? `cpu_architecture=${cpuArch}` : '';
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
