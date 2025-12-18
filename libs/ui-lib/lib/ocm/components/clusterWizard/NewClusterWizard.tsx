import classNames from 'classnames';
import React from 'react';
import ClusterDetails from './ClusterDetails';
import { useClusterWizardContext } from './ClusterWizardContext';
import ReviewStep from './disconnected/ReviewStep';
import BasicStep from './disconnected/BasicStep';
import OptionalConfigurationsStep from './disconnected/OptionalConfigurationsStep';
import DisconnectedStaticIp from './disconnected/DisconnectedStaticIp';
import { ClusterWizardStepsType } from './wizardTransition';
import { ModalDialogsContextProvider } from '../hosts/ModalDialogsContext';

const getCurrentStep = (currentStepId: ClusterWizardStepsType) => {
  switch (currentStepId) {
    case 'disconnected-review':
      return <ReviewStep />;
    case 'disconnected-basic':
      return <BasicStep />;
    case 'disconnected-optional-configurations':
      return <OptionalConfigurationsStep />;
    case 'static-ip-yaml-view':
    case 'static-ip-network-wide-configurations':
    case 'static-ip-host-configurations':
      return <DisconnectedStaticIp />;
    default:
      return <ClusterDetails />;
  }
};

const NewClusterWizard: React.FC = () => {
  const { currentStepId } = useClusterWizardContext();
  return (
    <ModalDialogsContextProvider>
      <div className={classNames('pf-v6-c-wizard', 'cluster-wizard')}>
        {getCurrentStep(currentStepId)}
      </div>
    </ModalDialogsContextProvider>
  );
};

export default NewClusterWizard;
