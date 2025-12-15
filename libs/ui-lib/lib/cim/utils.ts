import { Patch } from '@openshift-console/dynamic-plugin-sdk';
import { isEqual } from 'lodash-es';
import { StatusCondition } from './types';

export function getConditionByType<ConditionType>(
  conditions: StatusCondition<ConditionType>[],
  type: ConditionType,
): StatusCondition<ConditionType> | undefined {
  return conditions.find((c) => c.type === type);
}

export const appendPatch = <V>(patches: Patch[], path: string, newVal?: V, existingVal?: V) => {
  if (!isEqual(newVal, existingVal)) {
    patches.push({
      op: existingVal === undefined ? 'add' : 'replace',
      path,
      value: newVal,
    });
  }
};
