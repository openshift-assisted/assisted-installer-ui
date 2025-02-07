import { client } from '../axiosClient';

const OperatorsAPI = {
  makeBaseURI() {
    return `/v2/supported-operators`;
  },

  list() {
    return client.get<string[]>(`${OperatorsAPI.makeBaseURI()}`);
  },
};

export default OperatorsAPI;
