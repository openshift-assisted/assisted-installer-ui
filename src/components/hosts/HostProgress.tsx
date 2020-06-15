import React from 'react';
import { Host } from '../../api/types';
import {
  Progress,
  ProgressVariant,
  ProgressMeasureLocation,
  ProgressSize,
} from '@patternfly/react-core';

const getProgressVariant = (status: Host['status']) => {
  switch (status) {
    case 'error':
      return ProgressVariant.danger;
    case 'installed':
      return ProgressVariant.success;
    default:
      return undefined;
  }
};

const getMeasureLocation = (status: Host['status']) =>
  status === 'installed' ? ProgressMeasureLocation.none : ProgressMeasureLocation.top;

type HostProgressProps = {
  status: Host['status'];
  // progressInfo: Host['progressInfo']; // TODO(jtomasek) replace this once progressInfo is available
  progressInfo: {
    steps: string[];
    currentStep: string;
  };
};

const HostProgress: React.FC<HostProgressProps> = ({ status, progressInfo }) => {
  const { steps, currentStep } = progressInfo;
  const currentStepNumber = steps.indexOf(currentStep) + 1;

  return (
    <Progress
      title={status === 'installed' ? 'Finished' : currentStep}
      value={currentStepNumber}
      min={1}
      max={steps.length}
      label={`Step ${currentStepNumber} of ${steps.length}`}
      valueText={`Step ${currentStepNumber} of ${steps.length}: ${currentStep}`}
      variant={getProgressVariant(status)}
      measureLocation={getMeasureLocation(status)}
      size={ProgressSize.sm}
    />
  );
};

export default HostProgress;
