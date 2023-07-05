// Imports from `lodash/module` are not working in the monorepo
import { isArray, merge, cloneDeep } from 'lodash';

const isNewValidationId = (prevGroup, newGroup) =>
  prevGroup.find((prev) => {
    return newGroup.find((next) => prev.id === next.id);
  }) === undefined;

const addOrUpdateValidationInfo = (prevValidationGroup, newValidationGroup) => {
  if (isArray(prevValidationGroup) && isNewValidationId(prevValidationGroup, newValidationGroup)) {
    return prevValidationGroup.concat(newValidationGroup);
  }
  return prevValidationGroup;
};

const upgradeValidationsInfo = (prevValidationInfo, newValidationInfo) => {
  return merge(
    // Use clone to avoid changes propagating to other fixtures by reference
    cloneDeep(prevValidationInfo),
    cloneDeep(newValidationInfo),
    addOrUpdateValidationInfo,
  );
};

export { upgradeValidationsInfo };
