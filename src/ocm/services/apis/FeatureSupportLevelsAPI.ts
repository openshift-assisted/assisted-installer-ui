import { FeatureSupportLevels } from '../../../common/api/types';
import { client } from '../../api/axiosClient';

const FeatureSupportLevelsAPI = {
  makeBaseURI() {
    return `/v2/feature-support-levels`;
  },

  list() {
    return client.get<FeatureSupportLevels>(FeatureSupportLevelsAPI.makeBaseURI());
  },
};

export default FeatureSupportLevelsAPI;
