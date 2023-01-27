import {
  OPERATOR_NAME_LVM,
  Cluster,
  FeatureSupportLevelData,
  OperatorName,
  OPERATOR_NAME_LVMS,
} from '../../../../common';

export const handleLVMS = ({
  openshiftVersion,
  featureSupportLevel,
  operator = OPERATOR_NAME_LVM,
}: {
  openshiftVersion: Cluster['openshiftVersion'];
  featureSupportLevel: FeatureSupportLevelData;
  operator?: OperatorName;
}) => {
  if (
    operator === OPERATOR_NAME_LVM &&
    featureSupportLevel.getFeatureSupportLevel(openshiftVersion || '', 'LVM') === 'supported'
  ) {
    return OPERATOR_NAME_LVMS;
  }

  return operator;
};
