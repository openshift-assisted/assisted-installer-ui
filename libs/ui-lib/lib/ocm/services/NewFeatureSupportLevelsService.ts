import { getCpuArchitecture } from './CpuArchitectureService';
import { FeatureSupportLevelsAPI } from './apis';

const NewFeatureSupportLevelsService = {
  async getFeaturesSupportLevel(openshiftVersion: string, cpuArchitecture?: string) {
    const cpuArch = getCpuArchitecture(cpuArchitecture);
    const { data: features } = await FeatureSupportLevelsAPI.featuresSupportLevel(
      openshiftVersion,
      cpuArch,
    );
    return features;
  },
};
export default NewFeatureSupportLevelsService;
