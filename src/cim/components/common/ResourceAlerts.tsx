import React from 'react';
import {
  Alert,
  AlertVariant,
  TextContent,
  TextList,
  TextListItem,
  TextListItemVariants,
  TextListVariants,
} from '@patternfly/react-core';
import { StatusCondition, AgentStatusCondition } from '../../types';

import './ResourceAlerts.css';

export const SingleResourceAlerts: React.FC<{
  conditions: StatusCondition<string>[];
  title: string;
}> = ({ title, conditions }) => {
  if (!conditions.length) {
    return null;
  }

  return (
    <Alert title={title} variant={AlertVariant.danger} isInline className="cim-resource-alerts">
      <TextContent>
        <TextList component={TextListVariants.ul}>
          {conditions.map((c) => {
            const [title, ...messages] = c.message.split(/:|\.,/);
            return (
              <>
                <TextListItem component={TextListItemVariants.li}>
                  <strong>{title}</strong>
                </TextListItem>
                {messages.map((m) => (
                  <TextListItem key={m} component={TextListItemVariants.li}>
                    {m}
                  </TextListItem>
                ))}
              </>
            );
          })}
        </TextList>
      </TextContent>
    </Alert>
  );
};

export const AgentAlerts: React.FC<{
  agentsAlerts: { [key: string]: AgentStatusCondition[] };
}> = ({ agentsAlerts }) => {
  const failingAgentNames = Object.getOwnPropertyNames(agentsAlerts);
  if (!failingAgentNames.length) {
    return null;
  }

  return (
    <Alert
      title="Agents with issues"
      variant={AlertVariant.warning}
      isInline
      className="cim-resource-alerts"
    >
      <TextContent>
        <TextList component={TextListVariants.dl}>
          {failingAgentNames.map((agentName) => {
            const alerts: AgentStatusCondition[] = agentsAlerts[agentName];

            return (
              <>
                <TextListItem component={TextListItemVariants.dt}>{agentName}</TextListItem>
                {alerts.map((c) => {
                  const messages = c.message.split(/:|\.,/);
                  return messages.map((m) => (
                    <TextListItem key={m} component={TextListItemVariants.dd}>
                      {m}
                    </TextListItem>
                  ));
                })}
              </>
            );
          })}
        </TextList>
      </TextContent>
    </Alert>
  );
};
