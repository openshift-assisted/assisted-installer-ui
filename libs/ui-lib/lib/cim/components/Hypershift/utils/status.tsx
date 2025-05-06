import { CheckCircleIcon } from '@patternfly/react-icons/dist/js/icons/check-circle-icon';
import { ExclamationCircleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-circle-icon';
import { InProgressIcon } from '@patternfly/react-icons/dist/js/icons/in-progress-icon';
import React from 'react';
import {
  t_temp_dev_tbd as okColor /* CODEMODS: you should update this color token, original v5 token was global_palette_green_500 */,
} from '@patternfly/react-tokens/dist/js/t_temp_dev_tbd';
import {
  t_temp_dev_tbd as dangerColor /* CODEMODS: you should update this color token, original v5 token was global_danger_color_100 */,
} from '@patternfly/react-tokens/dist/js/t_temp_dev_tbd';
import {
  t_temp_dev_tbd as warningColor /* CODEMODS: you should update this color token, original v5 token was global_warning_color_100 */,
} from '@patternfly/react-tokens/dist/js/t_temp_dev_tbd';
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
