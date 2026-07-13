import classNames from 'classnames';
import React from 'react';
import ClusterDetails from './ClusterDetails';
import { useClusterWizardContext } from './ClusterWizardContext';
import ReviewStep from './disconnected/ReviewStep';
import BasicStep from './disconnected/BasicStep';
import { ClusterWizardStepsType } from './wizardTransition';
import { useInfraEnv } from '../../hooks';
import { CpuArchitecture } from '../../../common/types';
import { InfraEnv } from '@openshift-assisted/types/assisted-installer-service';

const getCurrentStep = (currentStepId: ClusterWizardStepsType, infraEnv?: InfraEnv) => {
  switch (currentStepId) {
    case 'disconnected-review':
      return <ReviewStep />;
    case 'disconnected-basic':
      return <BasicStep />;
    default:
      return <ClusterDetails infraEnv={infraEnv} />;
  }
};

const NewClusterWizard: React.FC = () => {
  const { infraEnv } = useInfraEnv('', CpuArchitecture.USE_DAY1_ARCHITECTURE);
  const { currentStepId } = useClusterWizardContext();

  return (
    <div className={classNames('pf-v6-c-wizard', 'cluster-wizard')}>
      {getCurrentStep(currentStepId, infraEnv)}
    </div>
  );
};

export default NewClusterWizard;
