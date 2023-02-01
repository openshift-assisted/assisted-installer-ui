import {
  OPERATOR_NAME_LVM,
  Cluster,
  FeatureSupportLevelData,
  ExposedOperatorName,
  OPERATOR_NAME_LVMS,
} from '../../../../common';

export const getActualLVMOperatorName = ({
  openshiftVersion,
  featureSupportLevel,
  operator = OPERATOR_NAME_LVM,
}: {
  openshiftVersion: Cluster['openshiftVersion'];
  featureSupportLevel: FeatureSupportLevelData;
  operator?: ExposedOperatorName;
}) => {
  if (
    operator === OPERATOR_NAME_LVM &&
    featureSupportLevel.getFeatureSupportLevel(openshiftVersion || '', 'LVM') === 'supported'
  ) {
    return OPERATOR_NAME_LVMS;
  }

  return operator;
};
