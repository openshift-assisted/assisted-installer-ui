import BundleAPI from '../../common/api/assisted-service/BundleAPI';

const BundleService = {
  async listBundles(
    openshiftVersion?: string,
    cpuArchitecture?: string,
    platformType?: string,
    featureIds?: string,
  ) {
    const { data: bundles } = await BundleAPI.list(
      openshiftVersion,
      cpuArchitecture,
      platformType,
      featureIds,
    );
    return bundles;
  },
  async listOperatorsByBundle(bundleName: string) {
    const { data } = await BundleAPI.listOperatorsForBundle(bundleName);
    return data;
  },
};

export default BundleService;
