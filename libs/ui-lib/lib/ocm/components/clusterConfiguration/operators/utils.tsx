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

export const getOdfLvmsText = (isSingleNode: boolean, OPCVersionGreaterThan4_15: boolean) => {
  if (OPCVersionGreaterThan4_15) {
    return 'OpenShift Data Foundation (recommended for creating additional on-premise clusters), Logical Volume Manager Storage or another persistent storage service';
  } else {
    if (isSingleNode) {
      return 'Logical Volume Manager Storage or another persistent storage service';
    } else {
      return 'OpenShift Data Foundation (recommended for creating additional on-premise clusters)  or another persistent storage service';
    }
  }
};
