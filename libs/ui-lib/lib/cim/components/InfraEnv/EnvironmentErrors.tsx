import * as React from 'react';
import { getFailingResourceConditions } from '../helpers';
import { InfraEnvK8sResource } from '../../types';
import { SingleResourceAlerts } from '../common/ResourceAlerts';
import { Alert, AlertVariant, ModalBoxBody } from '@patternfly/react-core';
import { getInfraEnvDocs } from '../common/constants';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';

export type EnvironmentErrorsProps = {
  infraEnv: InfraEnvK8sResource;
  docVersion: string;
  inModal?: boolean;
  children?: React.ReactNode;
};

export const EnvironmentErrors: React.FC<EnvironmentErrorsProps> = ({
  infraEnv,
  docVersion,
  children,
  inModal,
}) => {
  const infraEnvAlerts = getFailingResourceConditions(infraEnv, ['ImageCreated']);
  const { t } = useTranslation();

  if (infraEnv.status && !infraEnvAlerts.length) {
    return <>{children}</>;
  }

  const errors = (
    <>
      {!infraEnv.status && (
        <Alert
          title={t('ai:Central infrastructure management is not running')}
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
            'ai:It seems the Central infrastructure management is not configured which will prevent its features to be used. Please refer to the documentation for the first time setup steps.',
          )}
        </Alert>
      )}
      <SingleResourceAlerts
        title={t('ai:Failing infrastructure environment')}
        conditions={infraEnvAlerts}
      />
    </>
  );

  return inModal ? <ModalBoxBody>{errors}</ModalBoxBody> : errors;
};
