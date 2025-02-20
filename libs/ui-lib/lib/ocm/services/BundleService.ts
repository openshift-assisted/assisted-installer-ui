import BundleAPI from '../../common/api/assisted-service/BundleAPI';

const BundleService = {
  async listBundles() {
    const { data: bundles } = await BundleAPI.list();
    return bundles;
  },
  async listOperatorsByBundle(bundleName: string) {
    const { data } = await BundleAPI.listOperatorsForBundle(bundleName);
    return data;
  },
};

export default BundleService;
