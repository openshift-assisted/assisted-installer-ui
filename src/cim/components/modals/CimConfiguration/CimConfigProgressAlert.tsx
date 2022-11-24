import * as React from 'react';
import { Alert, AlertVariant, Button, ButtonVariant } from '@patternfly/react-core';

import { useTranslation } from '../../../../common/hooks/use-translation-wrapper';
import { AgentServiceConfigConditionType } from '../../../types';
import { CimConfigProgressAlertProps } from './types';
import { getConditionsByType } from '../../../utils';
import { onDeleteCimConfig } from './persist';

export const CimConfigProgressAlert: React.FC<CimConfigProgressAlertProps> = ({
  agentServiceConfig,
  showSuccess,
  showDelete,
  deleteResource,
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
  const onDelete = () => {
    if (!deleteResource) {
      return;
    }

    // TODO: REQUEST USER'S CONFIRMATION!

    void onDeleteCimConfig({ deleteResource });
  };

  const reconcileCompletedCondition = getConditionsByType<AgentServiceConfigConditionType>(
    agentServiceConfig.status?.conditions || [],
    'ReconcileCompleted',
  )?.[0];
  const actionLinks: React.ReactNode[] =
    showDelete && deleteResource
      ? [
          <Button variant={ButtonVariant.link} onClick={onDelete} isInline key="delete-cim">
            {t('ai:Delete Central management infrastructure configuration')}
          </Button>,
        ]
      : [];

  return (
    <Alert
      title={t('ai:Central infrastructure management is failing.')}
      variant={AlertVariant.danger}
      isInline
      actionLinks={actionLinks}
    >
      {t('ai:Error:')}{' '}
      {deploymentsHealthyCondition?.message || reconcileCompletedCondition?.message}
      {showDelete && (
        <>
          <br />
          {t(
            'ai:A common issue can be in misconfigured storage. You can fix it and then delete the configuration for starting over.',
          )}
        </>
      )}
    </Alert>
  );
};
