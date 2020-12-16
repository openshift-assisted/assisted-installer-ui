import React from 'react';
import { Cluster } from '../../api';
import ClusterWizardContext from './ClusterWizardContext';
import { CLUSTER_STEPS_INDEXED, CLUSTER_STEPS_ORDER } from './constants';

// TODO(mlibra): I prefer collocating all these canNext* functions for easier maintenance.
// They should be independent on each other anyway, so other option is to place them
// close to the corresponding Form component.
type TransitionProps = { isValid?: boolean; isSubmitting?: boolean; cluster: Cluster };

export const canNextClusterConfiguration = ({
  isValid,
  isSubmitting,
}: // cluster,
TransitionProps) => {
  let uiValidation = true;
  if (isValid !== undefined) {
    uiValidation = isValid && !isSubmitting;
  }

  // TODO(mlibra): check backend validations
  const backendValidation = true;

  return uiValidation && backendValidation;
};

export const canNextNetwork = ({ isValid, isSubmitting }: TransitionProps) => {
  let uiValidation = true;
  if (isValid !== undefined) {
    uiValidation = isValid && !isSubmitting;
  }

  // TODO(mlibra): check backend validations
  const backendValidation = true;

  return uiValidation && backendValidation;
};

const getNextClusterWizardStep = (step: string) =>
  CLUSTER_STEPS_ORDER[step] + 1 < CLUSTER_STEPS_INDEXED.length
    ? CLUSTER_STEPS_INDEXED[CLUSTER_STEPS_ORDER[step] + 1]
    : undefined;

const getBackClusterWizardStep = (step: string) =>
  CLUSTER_STEPS_ORDER[step] - 1 >= 0
    ? CLUSTER_STEPS_INDEXED[CLUSTER_STEPS_ORDER[step] - 1]
    : undefined;

export const useClusterWizardTransitionFunctions = (step: string) => {
  const { setCurrentStepId } = React.useContext(ClusterWizardContext);

  const stepBack = getBackClusterWizardStep(step);
  const stepNext = getNextClusterWizardStep(step);
  const onBack = stepBack ? () => setCurrentStepId(stepBack) : undefined;
  const onNext = stepNext ? () => setCurrentStepId(stepNext) : undefined;

  return { onBack, onNext };
};
