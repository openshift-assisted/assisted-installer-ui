import classNames from 'classnames';
import React from 'react';
import { InfraEnv } from '@openshift-assisted/types/assisted-installer-service';
import { CpuArchitecture } from '../../../common';
import { useInfraEnv } from '../../hooks';
import {
  ClusterDetails,
  BasicStep,
  OptionalConfigurationsStep,
  DisconnectedReviewStep,
  DisconnectedStaticIp,
} from './steps';
import { useClusterWizardContext } from './clusterWizardContext';
import { ClusterWizardStepsType } from './utils';

const getCurrentStep = (currentStepId: ClusterWizardStepsType, infraEnv?: InfraEnv) => {
  switch (currentStepId) {
    case 'disconnected-review':
      return <DisconnectedReviewStep />;
    case 'disconnected-optional-configurations':
      return <OptionalConfigurationsStep />;
    case 'disconnected-basic':
      return <BasicStep />;
    case 'static-ip-yaml-view':
    case 'static-ip-network-wide-configurations':
    case 'static-ip-host-configurations':
      return <DisconnectedStaticIp />;
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
