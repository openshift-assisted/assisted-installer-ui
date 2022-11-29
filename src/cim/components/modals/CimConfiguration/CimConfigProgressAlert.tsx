import * as React from 'react';
import { useHistory } from 'react-router-dom';
import {
  Alert,
  AlertVariant,
  AlertActionLink,
  AlertActionCloseButton,
} from '@patternfly/react-core';

import { useTranslation } from '../../../../common/hooks/use-translation-wrapper';
import { AgentServiceConfigConditionType } from '../../../types';
import { CimConfigProgressAlertProps } from './types';
import { getConditionsByType } from '../../../utils';
import { isCIMConfigProgressing, isCIMConfigured } from './utils';

const LOCAL_STORAGE_ID_SUCCESS = 'cim-config-progress-alert';

export const resetCimConfigProgressAlertSuccessStatus = () => {
  window.localStorage.setItem(LOCAL_STORAGE_ID_SUCCESS, '');
};

export const CimConfigProgressAlert: React.FC<CimConfigProgressAlertProps> = ({
  agentServiceConfig,
  assistedServiceDeploymentUrl,
}) => {
  const { t } = useTranslation();
  const history = useHistory();
  const [hideSuccess, setHideSuccess] = React.useState(true);

  React.useEffect(
    () => {
      setHideSuccess(window.localStorage.getItem(LOCAL_STORAGE_ID_SUCCESS) === 'closed');
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    undefined /* With every re-render */,
  );

  if (!agentServiceConfig) {
    // missing
    return null;
  }

  // success
  if (isCIMConfigured({ agentServiceConfig })) {
    if (hideSuccess) {
      return null;
    }

    const onCloseSuccess = () => {
      window.localStorage.setItem(LOCAL_STORAGE_ID_SUCCESS, 'closed');
      setHideSuccess(true);
    };

    return (
      <Alert
        variant={AlertVariant.success}
        isInline
        title={t('ai:Central infrastructure management is successfuly configured now.')}
        actionClose={<AlertActionCloseButton onClose={onCloseSuccess} />}
      />
    );
  }

  const assistedServiceDeploymentLink = (
    <AlertActionLink
      key="assisted-service-deployment"
      onClick={() => history.push(assistedServiceDeploymentUrl)}
    >
      {t('ai:Troubleshoot from the assisted service deployment')}
    </AlertActionLink>
  );

  // progressing
  if (isCIMConfigProgressing({ agentServiceConfig })) {
    const actionLinks: React.ReactNode[] = [assistedServiceDeploymentLink];
    return (
      <Alert
        variant={AlertVariant.info}
        isInline
        title={t('ai:Configuration may take a few minutes.')}
        actionLinks={actionLinks}
      >
        {t("ai:If the configuration is taking longer than 3 minutes, you'll need to troubleshoot.")}
      </Alert>
    );
  }

  const deploymentsHealthyCondition = getConditionsByType<AgentServiceConfigConditionType>(
    agentServiceConfig.status?.conditions || [],
    'DeploymentsHealthy',
  )?.[0];
  const reconcileCompletedCondition = getConditionsByType<AgentServiceConfigConditionType>(
    agentServiceConfig.status?.conditions || [],
    'ReconcileCompleted',
  )?.[0];

  const actionLinks: React.ReactNode[] = [assistedServiceDeploymentLink];

  return (
    <Alert
      title={t('ai:Central infrastructure management did not come up on time.')}
      variant={AlertVariant.danger}
      isInline
      actionLinks={actionLinks}
    >
      {t('ai:Last observed condition:')}{' '}
      {deploymentsHealthyCondition?.message || reconcileCompletedCondition?.message}
      <br />
      {t(
        'ai:You can either wait or investigate. A common issue can be in misconfigured storage. If you fix the issue, you can delete the AgentServiceConfig for starting over.',
      )}
    </Alert>
  );
};
