import * as React from 'react';
import { Alert, AlertVariant } from '@patternfly/react-core';

import { useTranslation } from '../../../../common/hooks/use-translation-wrapper';
import { AgentServiceConfigConditionType } from '../../../types';
import { CimConfigProgressAlertProps } from './types';
import { getConditionsByType } from '../../../utils';

export const CimConfigProgressAlert: React.FC<CimConfigProgressAlertProps> = ({
  agentServiceConfig,
  showSuccess,
}) => {
  const { t } = useTranslation();

  if (!agentServiceConfig) {
    // missing
    return null;
  }

  const deploymentsHealthyCondition = getConditionsByType<AgentServiceConfigConditionType>(
    agentServiceConfig.status?.conditions || [],
    'DeploymentsHealthy',
  )?.[0];

  // progressing
  if (!deploymentsHealthyCondition || deploymentsHealthyCondition.status === 'Unknown') {
    console.log('returning Progressing alert');
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

  // success
  if (deploymentsHealthyCondition.status === 'True') {
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

  // error
  const reconcileCompletedCondition = getConditionsByType<AgentServiceConfigConditionType>(
    agentServiceConfig.status?.conditions || [],
    'ReconcileCompleted',
  )?.[0];
  const actionLinks: React.ReactNode[] = [];
  return (
    <Alert
      title={t('ai:Central infrastructure management is failing.')}
      variant={AlertVariant.danger}
      isInline
      actionLinks={actionLinks}
    >
      {t('ai:Error:')}{' '}
      {deploymentsHealthyCondition?.message || reconcileCompletedCondition?.message}
    </Alert>
  );
};
