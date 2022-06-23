import { MonitoredOperatorsList } from '../../api';

export const getOlmOperators = (monitoredOperators: MonitoredOperatorsList | undefined) => {
  /* The API type defines the data as either undefined or an array.
     However, sometimes we receive "null" so setting a default value in this function would fail
  */
  return monitoredOperators
    ? monitoredOperators.filter((operator) => operator.operatorType === 'olm')
    : [];
};
