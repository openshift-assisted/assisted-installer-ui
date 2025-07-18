import OperatorsAPI from '../../common/api/assisted-service/OperatorsAPI';
import { getOperatorSpecs } from '../../common/components/operators/operatorSpecs';

const getAllKnownOperatorKeys = (): Set<string> => {
  const allSpecsByCategory = getOperatorSpecs(() => undefined);

  const allKeys = Object.values(allSpecsByCategory)
    .flat()
    .map((spec) => spec.operatorKey);

  return new Set(allKeys);
};

const OperatorsService = {
  getSupportedOperators: async (): Promise<string[]> => {
    const knownOperatorKeys = getAllKnownOperatorKeys();
    const { data: operatorsFromAPI } = await OperatorsAPI.list();
    const filteredOperators = operatorsFromAPI.filter((operatorName) =>
      knownOperatorKeys.has(operatorName),
    );

    return filteredOperators;
  },
};
export default OperatorsService;
