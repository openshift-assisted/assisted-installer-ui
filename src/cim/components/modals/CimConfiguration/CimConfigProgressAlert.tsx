import * as React from 'react';
import { useHistory } from 'react-router-dom';
import { Alert, AlertVariant, AlertActionLink } from '@patternfly/react-core';

import { useTranslation } from '../../../../common/hooks/use-translation-wrapper';
import { AgentServiceConfigConditionType } from '../../../types';
import { CimConfigProgressAlertProps } from './types';
import { getConditionsByType } from '../../../utils';
import { isCIMConfigProgressing, isCIMConfigured } from './utils';

export const CimConfigProgressAlert: React.FC<CimConfigProgressAlertProps> = ({
  agentServiceConfig,
  showSuccess,
  showError,
  showTroublehooting,
  assistedServiceDeploymentUrl,
  showProgress,
}) => {
  const { t } = useTranslation();
  const history = useHistory();

  if (!agentServiceConfig) {
    // missing
    return null;
  }

  // progressing
  if (isCIMConfigProgressing({ agentServiceConfig })) {
    if (showProgress) {
      return (
        <Alert
          variant={AlertVariant.info}
          isInline
          title={t(
            'ai:Central infrastructure management configuration persisted, waiting on operator to reconcile.',
          )}
        />
      );
    }
    return null;
  }

  // success
  if (isCIMConfigured({ agentServiceConfig })) {
    if (!showSuccess) {
      return null;
    }

    return (
      <Alert
        variant={AlertVariant.success}
        isInline
        title={t('ai:Central infrastructure management is successfuly configured now.')}
      />
    );
  }

  if (showError) {
    const deploymentsHealthyCondition = getConditionsByType<AgentServiceConfigConditionType>(
      agentServiceConfig.status?.conditions || [],
      'DeploymentsHealthy',
    )?.[0];
    const reconcileCompletedCondition = getConditionsByType<AgentServiceConfigConditionType>(
      agentServiceConfig.status?.conditions || [],
      'ReconcileCompleted',
    )?.[0];

    const actionLinks: React.ReactNode[] =
      showTroublehooting && assistedServiceDeploymentUrl
        ? [
            <AlertActionLink
              key="install-storage-operator"
              onClick={() => history.push(assistedServiceDeploymentUrl)}
            >
              {t('ai:Troubleshoot from the assisted service deployment')}
            </AlertActionLink>,
          ]
        : [];

    return (
      <Alert
        title={t('ai:Central infrastructure management did not come up on time.')}
        variant={AlertVariant.danger}
        isInline
        actionLinks={actionLinks}
      >
        {t('ai:Error:')}{' '}
        {deploymentsHealthyCondition?.message || reconcileCompletedCondition?.message}
        {showTroublehooting && (
          <>
            <br />
            {t(
              'ai:Your can either wait or investigate. A common issue can be in misconfigured storage. If you fix the issue, you can delete the AgentServiceConfig for starting over.',
            )}
          </>
        )}
      </Alert>
    );
  }

  return null;
};
