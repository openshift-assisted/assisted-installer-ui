import classNames from 'classnames';
import React from 'react';
import ClusterDetails from './ClusterDetails';
import { useClusterWizardContext } from './ClusterWizardContext';
import ReviewStep from './disconnected/ReviewStep';
import BasicStep from './disconnected/BasicStep';

const NewClusterWizard: React.FC = () => {
  const { currentStepId } = useClusterWizardContext();

  const renderCurrentStep = React.useCallback(() => {
    switch (currentStepId) {
      case 'disconnected-review':
        return <ReviewStep />;
      case 'disconnected-basic':
        return <BasicStep />;
      default:
        return <ClusterDetails />;
    }
  }, [currentStepId]);
  return (
    <div className={classNames('pf-v5-c-wizard', 'cluster-wizard')}>{renderCurrentStep()}</div>
  );
};

export default NewClusterWizard;
