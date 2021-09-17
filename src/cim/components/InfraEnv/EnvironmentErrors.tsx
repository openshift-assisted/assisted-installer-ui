import * as React from 'react';
import { getFailingResourceConditions } from '../helpers';
import { InfraEnvK8sResource } from '../../types';
import { SingleResourceAlerts } from '../common/ResourceAlerts';

export type EnvironmentErrorsProps = {
  infraEnv: InfraEnvK8sResource;
};

export const EnvironmentErrors: React.FC<EnvironmentErrorsProps> = ({ infraEnv }) => {
  const infraEnvAlerts = getFailingResourceConditions(infraEnv, undefined /* For ALL */);

  return (
    <SingleResourceAlerts title="Failing infrastructure environment" conditions={infraEnvAlerts} />
  );
};
