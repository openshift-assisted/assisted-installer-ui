import { getCpuArchitecture } from './CpuArchitectureService';
import { NewFeatureSupportLevelsAPI } from './apis';

const NewFeatureSupportLevelsService = {
  async getFeaturesSupportLevel(openshiftVersion: string, cpuArchitecture?: string) {
    const cpuArch = getCpuArchitecture(cpuArchitecture);
    const { data: features } = await NewFeatureSupportLevelsAPI.featuresSupportLevel(
      openshiftVersion,
      cpuArch,
    );
    return features;
  },
};
export default NewFeatureSupportLevelsService;
