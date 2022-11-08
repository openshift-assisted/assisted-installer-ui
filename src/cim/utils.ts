import { StatusCondition } from './types';

export function getConditionsByType<ConditionType>(
  conditions: StatusCondition<ConditionType>[],
  type: ConditionType,
): StatusCondition<ConditionType>[] {
  return conditions.filter((c) => c.type === type);
}
