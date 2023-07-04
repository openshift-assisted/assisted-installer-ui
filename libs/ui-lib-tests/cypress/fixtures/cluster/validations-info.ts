// Imports from `lodash/module` are not working in the monorepo
import { isArray, merge, cloneDeep } from 'lodash';

const addOrUpdateValidationInfo = (prevValidationGroup, newValidationGroup) => {
  const isNewValidationId = () =>
    prevValidationGroup.find((prev) => {
      return newValidationGroup.find((next) => prev.id === next.id);
    }) === undefined;

  if (isArray(prevValidationGroup) && isNewValidationId()) {
    return prevValidationGroup.concat(newValidationGroup);
  }
  return prevValidationGroup;
};

const upgradeValidationsInfo = (prevValidationInfo, newValidationInfo) => {
  return merge(
    cloneDeep(prevValidationInfo),
    cloneDeep(prevValidationInfo),
    addOrUpdateValidationInfo,
  );
};

export { upgradeValidationsInfo };
