import {
  areOnlySoftValidationsFailing,
  getWizardStepHostStatus,
  getWizardStepHostValidationsInfo,
  Host,
  stringToJSON,
} from '../../../common';
import { ValidationsInfo } from '../../../common/types/hosts';
import {
  wizardStepsValidationsMap,
  ClusterWizardStepsType,
} from '../ClusterDeployment/wizardTransition';

const getStatus = (host: Host, statusType: ClusterWizardStepsType) => {
  const validationsInfo = stringToJSON<ValidationsInfo>(host.validationsInfo) || {};
  const statusOverride =
    getWizardStepHostStatus(statusType, wizardStepsValidationsMap, host) || host.status;
  const stepValidationsInfo = getWizardStepHostValidationsInfo(
    validationsInfo,
    statusType,
    wizardStepsValidationsMap,
  );
  const sublabel = areOnlySoftValidationsFailing(
    validationsInfo,
    statusType,
    wizardStepsValidationsMap,
  )
    ? 'Some validations failed'
    : undefined;

  return { statusOverride, sublabel, validationsInfo: stepValidationsInfo };
};

export const getHardwareStatus = (host: Host) => getStatus(host, 'hosts-selection');
export const getNetworkStatus = (host: Host) => getStatus(host, 'networking');
