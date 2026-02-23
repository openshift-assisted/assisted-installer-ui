import classNames from 'classnames';
import React from 'react';
import ClusterDetails from './ClusterDetails';
import { useClusterWizardContext } from './ClusterWizardContext';
import ReviewStep from './disconnected/ReviewStep';
import BasicStep from './disconnected/BasicStep';
import OptionalConfigurationsStep from './disconnected/OptionalConfigurationsStep';
import { ClusterWizardStepsType } from './wizardTransition';

const getCurrentStep = (currentStepId: ClusterWizardStepsType) => {
  switch (currentStepId) {
    case 'disconnected-review':
      return <ReviewStep />;
    case 'disconnected-basic':
      return <BasicStep />;
    case 'disconnected-optional-configurations':
      return <OptionalConfigurationsStep />;
    default:
      return <ClusterDetails />;
  }
};

const NewClusterWizard: React.FC = () => {
  const { currentStepId } = useClusterWizardContext();
  return (
    <div className={classNames('pf-v6-c-wizard', 'cluster-wizard')}>
      {getCurrentStep(currentStepId)}
    </div>
  );
};

export default NewClusterWizard;
