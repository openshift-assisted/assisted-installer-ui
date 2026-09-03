import { defaultWizardSteps, staticIpFormViewSubSteps } from '../constants';
import { StaticIpView } from '../steps/staticIp/data/dataTypes';
import { ClusterWizardStepsType, disconnectedSteps } from '../utils';

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

export const removeStepFromClusterWizard = (
  wizardStepIds: ClusterWizardStepsType[],
  itemToRemove: ClusterWizardStepsType,
  numberItemsToRemove: number,
): ClusterWizardStepsType[] => {
  const stepsIds = [...wizardStepIds];
  const position = stepsIds.findIndex((step) => step === itemToRemove);
  if (position !== -1) {
    stepsIds.splice(position, numberItemsToRemove);
  }
  return stepsIds;
};

export const getWizardStepIds = (
  wizardStepIds: ClusterWizardStepsType[] | undefined,
  staticIpView?: StaticIpView | 'dhcp-selected',
  isSingleClusterFeatureEnabled?: boolean,
): ClusterWizardStepsType[] => {
  let stepsCopy = wizardStepIds ? [...wizardStepIds] : [...defaultWizardSteps];
  if (staticIpView === StaticIpView.YAML) {
    stepsCopy = removeStepFromClusterWizard(stepsCopy, 'static-ip-network-wide-configurations', 2);
    stepsCopy = addStepToClusterWizard(stepsCopy, 'cluster-details', ['static-ip-yaml-view']);
  } else if (staticIpView === StaticIpView.FORM) {
    stepsCopy = removeStepFromClusterWizard(stepsCopy, 'static-ip-yaml-view', 1);
    stepsCopy = addStepToClusterWizard(stepsCopy, 'cluster-details', staticIpFormViewSubSteps);
  } else if (staticIpView === 'dhcp-selected') {
    stepsCopy = removeStepFromClusterWizard(stepsCopy, 'static-ip-network-wide-configurations', 2);
  }

  if (isSingleClusterFeatureEnabled && !stepsCopy.includes('credentials-download')) {
    stepsCopy = addStepToClusterWizard(stepsCopy, 'custom-manifests', ['credentials-download']);
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
    return addStepToClusterWizard(copy, 'disconnected-optional-configurations', [
      'static-ip-yaml-view',
    ]);
  }
  if (staticIpView === StaticIpView.FORM) {
    return addStepToClusterWizard(copy, 'disconnected-optional-configurations', [
      'static-ip-network-wide-configurations',
      'static-ip-host-configurations',
    ]);
  }

  return copy;
};
