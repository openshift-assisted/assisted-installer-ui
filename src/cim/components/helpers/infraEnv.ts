import { InfraEnvK8sResource } from '../../types';

export const isAIFlowInfraEnv = (infraEnv?: InfraEnvK8sResource): boolean =>
  !!infraEnv?.spec?.clusterRef?.name;
