import { StaticIpView } from '../clusterConfiguration/staticIp/data/dataTypes';
import { defaultWizardSteps, staticIpFormViewSubSteps } from './constants';
import { ClusterWizardStepsType, disconnectedSteps } from './wizardTransition';

export const addStepToClusterWizard = (
  wizardStepIds: ClusterWizardStepsType[],
  addAfterStep: ClusterWizardStepsType,
  itemsToAdd: ClusterWizardStepsType[],
): ClusterWizardStepsType[] => {
  const stepsIds = [...wizardStepIds];
  const referencePosition = stepsIds.findIndex((step) => step === addAfterStep);
  const found = wizardStepIds.filter((step) => step === itemsToAdd[0]);
  if (referencePosition !== -1 && found.length === 0) {
    stepsIds.splice(referencePosition + 1, 0, ...itemsToAdd);
  }
  return stepsIds;
};

export const getWizardStepIds = (
  staticIpView?: StaticIpView | 'dhcp-selected',
  isSingleClusterFeatureEnabled?: boolean,
): ClusterWizardStepsType[] => {
  let stepsCopy = [...defaultWizardSteps];

  if (isSingleClusterFeatureEnabled) {
    stepsCopy = addStepToClusterWizard(stepsCopy, 'custom-manifests', ['credentials-download']);
    return stepsCopy;
  }

  if (staticIpView === StaticIpView.YAML) {
    stepsCopy = addStepToClusterWizard(stepsCopy, 'cluster-details', ['static-ip-yaml-view']);
  } else if (staticIpView === StaticIpView.FORM) {
    stepsCopy = addStepToClusterWizard(stepsCopy, 'cluster-details', staticIpFormViewSubSteps);
  }

  return stepsCopy;
};

export const getDisconnectedWizardStepIds = (
  staticIpView?: StaticIpView | 'dhcp-selected',
): ClusterWizardStepsType[] => {
  // Always rebuild from the base disconnected steps so toggling static IP / DHCP
  // cannot leave leftover sub-steps in the list.
  const copy = [...disconnectedSteps];

  if (staticIpView === StaticIpView.YAML) {
    return addStepToClusterWizard(copy, 'disconnected-basic', ['static-ip-yaml-view']);
  }
  if (staticIpView === StaticIpView.FORM) {
    return addStepToClusterWizard(copy, 'disconnected-basic', [
      'static-ip-network-wide-configurations',
      'static-ip-host-configurations',
    ]);
  }

  return copy;
};
