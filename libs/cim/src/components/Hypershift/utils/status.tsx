import { CheckCircleIcon } from '@patternfly/react-icons/dist/js/icons/check-circle-icon';
import { ExclamationCircleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-circle-icon';
import { InProgressIcon } from '@patternfly/react-icons/dist/js/icons/in-progress-icon';
import React from 'react';
import { t_global_color_status_success_default as okColor } from '@patternfly/react-tokens/dist/js/t_global_color_status_success_default';
import { t_global_icon_color_status_danger_default as dangerColor } from '@patternfly/react-tokens/dist/js/t_global_icon_color_status_danger_default';
import { t_global_icon_color_status_warning_default as warningColor } from '@patternfly/react-tokens/dist/js/t_global_icon_color_status_warning_default';
import { AgentK8sResource } from '../../../types';
import { getAgentStatus } from '../../helpers';
import { NodePoolK8sResource } from '../types';
import { TFunction } from 'i18next';
import { agentStatus } from '../../helpers/agentStatus';

export type NodePoolStatus = {
  type: 'error' | 'pending' | 'ok' | 'warning';
  text: string;
  icon: React.ReactNode;
};

export const getNodePoolStatus = (
  nodePool: NodePoolK8sResource,
  agents: AgentK8sResource[],
  t: TFunction,
): NodePoolStatus => {
  if (!agents.length && nodePool.spec.replicas) {
    return {
      type: 'pending',
      icon: <InProgressIcon />,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      text: t('ai:Pending host assignment'),
    };
  }

  const allAgentStatuses = agentStatus(t);
  const agentStatuses = agents.map((a) => getAgentStatus(a, allAgentStatuses));

  const hasErrorAgents = agentStatuses.some(({ status }) => status.key === 'error');

  if (hasErrorAgents) {
    return {
      type: 'error',
      icon: <ExclamationCircleIcon color={dangerColor.value} />,
      text: t('ai:Error'),
    };
  }

  const hasWarningAgents = agentStatuses.some(({ status }) =>
    [
      'pending-for-input',
      'insufficient',
      'insufficient-unbound',
      'disconnected-unbound',
      'disconnected',
    ].includes(status.key),
  );

  if (hasWarningAgents) {
    return {
      type: 'warning',
      icon: <ExclamationCircleIcon color={warningColor.value} />,
      text: t('ai:Warning'),
    };
  }

  return nodePool.status?.conditions?.find(({ type }) => type === 'Ready')?.status === 'True'
    ? {
        type: 'ok',
        icon: <CheckCircleIcon color={okColor.value} />,
        text: t('ai:Ready'),
      }
    : {
        type: 'pending',
        icon: <InProgressIcon />,
        text: t('ai:Not ready'),
      };
};
