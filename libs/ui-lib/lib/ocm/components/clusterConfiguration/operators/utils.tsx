import {
  OPERATOR_NAME_LVM,
  FeatureSupportLevelData,
  ExposedOperatorName,
  OPERATOR_NAME_LVMS,
} from '../../../../common';
import { Cluster } from '@openshift-assisted/types/assisted-installer-service';

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
