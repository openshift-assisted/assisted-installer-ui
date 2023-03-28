import { CpuArchitecture } from '../../../common';
import {
  ArchitectureSupportLevelId,
  FeatureSupportLevelId,
  SupportLevel,
} from '../../../common/api/types';
import { clientWithoutConverter } from '../../api/axiosClient';

export interface ArchitecturesSupportsLevel {
  architectures: Record<CpuArchitecture, SupportLevel>;
}

const NewFeatureSupportLevelsAPI = {
  makeBaseURI() {
    return `/v2/support-levels`;
  },

  featuresSupportLevel(openshiftVersion: string, cpuArchitecture?: string) {
    let queryParams = '?';
    queryParams += openshiftVersion ? `openshift_version=${openshiftVersion}&` : '';
    queryParams += cpuArchitecture ? `cpu_architecture=${cpuArchitecture}` : '';
    return clientWithoutConverter.get<Record<FeatureSupportLevelId, SupportLevel>>(
      `${NewFeatureSupportLevelsAPI.makeBaseURI()}/features${queryParams}`,
    );
  },

  architecturesSupportLevel(openshiftVersion: string) {
    let queryParams = '?';
    queryParams += openshiftVersion ? `openshift_version=${openshiftVersion}&` : '';
    return clientWithoutConverter.get<Record<ArchitectureSupportLevelId, SupportLevel>>(
      `${NewFeatureSupportLevelsAPI.makeBaseURI()}/architectures${queryParams}`,
    );
  },
};

export default NewFeatureSupportLevelsAPI;
