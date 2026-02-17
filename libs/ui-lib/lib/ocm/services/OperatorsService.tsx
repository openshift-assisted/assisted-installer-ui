import OperatorsAPI from '../../common/api/assisted-service/OperatorsAPI';
import { OperatorProperties } from '@openshift-assisted/types/assisted-installer-service';

const OperatorsService = {
  getSupportedOperators: async (): Promise<string[]> => {
    const { data: operators } = await OperatorsAPI.list();
    return operators;
  },

  getOperatorProperties: async (operatorName: string): Promise<OperatorProperties> => {
    const { data: properties } = await OperatorsAPI.getProperties(operatorName);
    return properties;
  },
};
export default OperatorsService;
