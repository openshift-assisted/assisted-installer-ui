import { OperatorsValues } from '../../../common';
import {
  NETWORK_OBSERVABILITY_OPERATOR_ID,
  validateNetworkObservabilityProperties,
} from '../clusterConfiguration/operators/networkObservabilityProperties';

export const validateOperatorsValues = (values: OperatorsValues) => {
  const errors: { operatorProperties?: Record<string, string> } = {};

  if (values.selectedOperators.includes(NETWORK_OBSERVABILITY_OPERATOR_ID)) {
    const validationError = validateNetworkObservabilityProperties(
      values.operatorProperties[NETWORK_OBSERVABILITY_OPERATOR_ID],
    );
    if (validationError) {
      errors.operatorProperties = {
        [NETWORK_OBSERVABILITY_OPERATOR_ID]: validationError,
      };
    }
  }

  return errors;
};
