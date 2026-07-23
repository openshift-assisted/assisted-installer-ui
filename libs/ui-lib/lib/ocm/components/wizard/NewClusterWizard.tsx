import classNames from 'classnames';
import React from 'react';
import { InfraEnv } from '@openshift-assisted/types/assisted-installer-service';
import { useInfraEnv } from '../../hooks';
import { CpuArchitecture } from '../../../common';
import { ClusterWizardStepsType } from './utils';
import { BasicStep, ClusterDetails, DisconnectedReviewStep } from './steps';
import { useClusterWizardContext } from './clusterWizardContext';

const getCurrentStep = (currentStepId: ClusterWizardStepsType, infraEnv?: InfraEnv) => {
  switch (currentStepId) {
    case 'disconnected-review':
      return <DisconnectedReviewStep />;
    case 'disconnected-basic':
      return <BasicStep />;
    default:
      return <ClusterDetails infraEnv={infraEnv} />;
  }
};

export const NewClusterWizard: React.FC = () => {
  const { infraEnv } = useInfraEnv('', CpuArchitecture.USE_DAY1_ARCHITECTURE);
  const { currentStepId } = useClusterWizardContext();

  return (
    <div className={classNames('pf-v6-c-wizard', 'cluster-wizard')}>
      {getCurrentStep(currentStepId, infraEnv)}
    </div>
  );
};
