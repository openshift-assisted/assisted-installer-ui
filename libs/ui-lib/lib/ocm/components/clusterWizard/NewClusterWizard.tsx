import classNames from 'classnames';
import React from 'react';
import ClusterDetails from './ClusterDetails';
import { useClusterWizardContext } from './ClusterWizardContext';
import ReviewStep from './disconnected/ReviewStep';
import BasicStep from './disconnected/BasicStep';
import OptionalConfigurationsStep from './disconnected/OptionalConfigurationsStep';
import { ClusterWizardStepsType } from './wizardTransition';
import { ModalDialogsContextProvider } from '../hosts/ModalDialogsContext';
import useInfraEnv from '../../hooks/useInfraEnv';
import { CpuArchitecture } from '../../../common';
import { useParams } from 'react-router-dom-v5-compat';
import { InfraEnv } from '@openshift-assisted/types/assisted-installer-service';

const getCurrentStep = (currentStepId: ClusterWizardStepsType, infraEnv?: InfraEnv) => {
  switch (currentStepId) {
    case 'disconnected-review':
      return <ReviewStep />;
    case 'disconnected-basic':
      return <BasicStep />;
    case 'disconnected-optional-configurations':
      return <OptionalConfigurationsStep />;
    default:
      return <ClusterDetails infraEnv={infraEnv} />;
  }
};

const NewClusterWizard: React.FC = () => {
  const { currentStepId } = useClusterWizardContext();
  const { clusterId } = useParams() as { clusterId: string };
  const { infraEnv } = useInfraEnv(clusterId, CpuArchitecture.USE_DAY1_ARCHITECTURE);

  return (
    <ModalDialogsContextProvider>
      <div className={classNames('pf-v6-c-wizard', 'cluster-wizard')}>
        {getCurrentStep(currentStepId, infraEnv)}
      </div>
    </ModalDialogsContextProvider>
  );
};

export default NewClusterWizard;
