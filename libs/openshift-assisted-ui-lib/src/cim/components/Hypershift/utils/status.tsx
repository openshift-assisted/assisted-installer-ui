import { CheckCircleIcon, ExclamationCircleIcon, InProgressIcon } from '@patternfly/react-icons';
import React from 'react';
import {
  global_palette_green_500 as okColor,
  global_danger_color_100 as dangerColor,
  global_warning_color_100 as warningColor,
} from '@patternfly/react-tokens';
import { AgentK8sResource } from '../../../types';
import { getAgentStatus } from '../../helpers';
import { NodePoolK8sResource } from '../types';
import { TFunction } from 'i18next';

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
      text: t('ai:Pending host assignment'),
    };
  }

  const agentStatuses = agents.map((a) => getAgentStatus(a));

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
