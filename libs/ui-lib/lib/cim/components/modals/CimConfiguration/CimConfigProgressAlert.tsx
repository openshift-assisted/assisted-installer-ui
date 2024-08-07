import * as React from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';
import {
  Alert,
  AlertVariant,
  Button,
  ButtonVariant,
  AlertActionCloseButton,
} from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons/dist/js/icons/external-link-alt-icon';

import { useTranslation } from '../../../../common/hooks/use-translation-wrapper';
import { AgentServiceConfigConditionType } from '../../../types';
import { CimConfigProgressAlertProps } from './types';
import { getConditionByType } from '../../../utils';
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
  const navigate = useNavigate();
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
        title={t('ai:Host inventory configured successfully.')}
        actionClose={<AlertActionCloseButton onClose={onCloseSuccess} />}
      />
    );
  }

  const assistedServiceDeploymentLink = (
    <Button
      variant={ButtonVariant.link}
      isInline
      key="assisted-service-deployment"
      onClick={() => navigate(assistedServiceDeploymentUrl)}
    >
      {t('ai:Troubleshoot in the assisted service deployment')} <ExternalLinkAltIcon />
    </Button>
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
        {t(
          'ai:If the configuration is taking longer than 5 minutes, you might need to troubleshoot.',
        )}
      </Alert>
    );
  }

  const deploymentsHealthyCondition = getConditionByType<AgentServiceConfigConditionType>(
    agentServiceConfig.status?.conditions || [],
    'DeploymentsHealthy',
  );
  const reconcileCompletedCondition = getConditionByType<AgentServiceConfigConditionType>(
    agentServiceConfig.status?.conditions || [],
    'ReconcileCompleted',
  );

  const actionLinks: React.ReactNode[] = [assistedServiceDeploymentLink];

  return (
    <Alert
      title={t('ai:Configuration is hanging for a long time.')}
      variant={AlertVariant.info}
      isInline
      actionLinks={actionLinks}
    >
      {t('ai:Last observed condition:')}{' '}
      {deploymentsHealthyCondition?.message || reconcileCompletedCondition?.message}
      <br />
      {t(
        'ai:You can either wait or investigate. A common issue can be misconfigured storage. Once you fix the issue, you can delete AgentServiceConfig to try again.',
      )}
    </Alert>
  );
};
