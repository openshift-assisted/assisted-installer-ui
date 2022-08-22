import * as React from 'react';
import { Alert, AlertVariant } from '@patternfly/react-core';
import { getInfraEnvDocs } from '../common/constants';
import { getInfraEnvNameOfAgent } from '../helpers';
import { BareMetalHostK8sResource, InfraEnvK8sResource } from '../../types';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';

type AgentAlertsProps = {
  docVersion: string;
  infraEnv: InfraEnvK8sResource;
  bareMetalHosts: BareMetalHostK8sResource[];
};

const AgentAlerts: React.FC<AgentAlertsProps> = ({ infraEnv, bareMetalHosts, docVersion }) => {
  const infraBMHs =
    infraEnv &&
    bareMetalHosts?.filter(
      (h) =>
        h.metadata?.namespace === infraEnv.metadata?.namespace &&
        getInfraEnvNameOfAgent(h) === infraEnv.metadata?.name,
    );
  const { t } = useTranslation();
  return (
    <>
      {infraBMHs?.some((bmh) => !bmh.status) && (
        <Alert
          title={t('ai:Metal3 operator is not configured')}
          variant={AlertVariant.warning}
          isInline
          className="cim-resource-alerts"
          actionLinks={
            <a href={getInfraEnvDocs(docVersion)} target="_blank" rel="noopener noreferrer">
              {t('ai:Open documentation')}
            </a>
          }
        >
          {t(
            'ai:It seems the Metal3 operator is missing configuration which will prevent it to find bare metal hosts in this namespace. Please refer to the documentation for the first time setup steps.',
          )}
        </Alert>
      )}
    </>
  );
};

export default AgentAlerts;
