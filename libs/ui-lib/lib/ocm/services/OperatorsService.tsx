import OperatorsAPI from '../../common/api/assisted-service/OperatorsAPI';

const OperatorsService = {
  getSupportedOperators: async (): Promise<string[]> => {
    const { data: operators } = await OperatorsAPI.list();
    return operators;
  },
};
export default OperatorsService;
