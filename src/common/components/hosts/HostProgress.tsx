import React from 'react';
import {
  Progress,
  ProgressVariant,
  ProgressMeasureLocation,
  ProgressSize,
} from '@patternfly/react-core';
import { Host } from '../../api';
import { getHostProgress, getHostProgressStages, getHostProgressStageNumber } from './utils';

const getProgressVariant = (status: Host['status']) => {
  switch (status) {
    case 'cancelled':
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

const HostProgress = ({ host }: { host: Host }) => {
  const { status } = host;
  const stages = getHostProgressStages(host);
  const { currentStage, progressInfo } = getHostProgress(host);
  const currentStageNumber = getHostProgressStageNumber(host);
  const progressLabel = `${currentStage}${progressInfo ? `: ${progressInfo}` : ' '}`;

  return (
    <Progress
      title={progressLabel}
      value={currentStageNumber}
      min={1}
      max={stages.length}
      label={`Step ${currentStageNumber} of ${stages.length}`}
      valueText={`Step ${currentStageNumber} of ${stages.length}: ${progressLabel}`}
      variant={getProgressVariant(status)}
      measureLocation={getMeasureLocation(status)}
      size={ProgressSize.sm}
    />
  );
};

export default HostProgress;
