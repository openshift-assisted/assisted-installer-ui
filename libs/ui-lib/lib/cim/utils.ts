import { StatusCondition } from './types';

export function getConditionByType<ConditionType>(
  conditions: StatusCondition<ConditionType>[],
  type: ConditionType,
): StatusCondition<ConditionType> | undefined {
  return conditions.find((c) => c.type === type);
}
