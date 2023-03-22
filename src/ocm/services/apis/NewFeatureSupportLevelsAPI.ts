import { SupportLevels } from '../../../common/api/types';
import { client } from '../../api/axiosClient';

const NewFeatureSupportLevelsAPI = {
  makeBaseURI() {
    return `/v2/support-levels`;
  },

  listFeatures(openshiftVersion: string, cpuArchitecture?: string) {
    let queryParams = '?';
    queryParams += openshiftVersion ? `openshift_version=${openshiftVersion}&` : '';
    queryParams += cpuArchitecture ? `cpu_architecture=${cpuArchitecture}` : '';
    return client.get<SupportLevels>(
      `${NewFeatureSupportLevelsAPI.makeBaseURI()}/features${queryParams}`,
    );
  },

  listArchitectures(openshiftVersion: string) {
    let queryParams = '?';
    queryParams += openshiftVersion ? `openshift_version=${openshiftVersion}&` : '';
    return client.get<SupportLevels>(
      `${NewFeatureSupportLevelsAPI.makeBaseURI()}/architectures${queryParams}`,
    );
  },
};

export default NewFeatureSupportLevelsAPI;
