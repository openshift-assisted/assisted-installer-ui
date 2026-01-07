import { client } from '../axiosClient';
import { OperatorProperties } from '@openshift-assisted/types/assisted-installer-service';

const OperatorsAPI = {
  makeBaseURI() {
    return `/v2/supported-operators`;
  },

  list() {
    return client.get<string[]>(`${OperatorsAPI.makeBaseURI()}`);
  },

  getProperties(operatorName: string) {
    return client.get<OperatorProperties>(
      `${OperatorsAPI.makeBaseURI()}/${encodeURIComponent(operatorName)}`,
    );
  },
};

export default OperatorsAPI;
