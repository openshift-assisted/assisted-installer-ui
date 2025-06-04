import React from 'react';
import {
  Alert,
  AlertVariant,
  Content,
  ContentVariants,
  } from '@patternfly/react-core';
import { StatusCondition } from '../../types';

import './ResourceAlerts.css';

export const SingleResourceAlerts: React.FC<{
  conditions: StatusCondition<string>[];
  title: string;
}> = ({ title, conditions }) => {
  if (!conditions.length) {
    return null;
  }

  return (
    <Alert
      title={title}
      variant={AlertVariant.danger}
      isInline
      className="cim-resource-alerts cim-resource-alerts--noul"
    >
      <Content>
        <Content component={ContentVariants.ul}>
          {conditions.map((c) => {
            if (c.message) {
              const [title, ...messages] = c.message.split(/:|\.,/);
              return (
                <React.Fragment key={c.type}>
                  <Content component={ContentVariants.li}>
                    <strong>{title}</strong>
                  </Content>
                  {messages.map((m) => (
                    <Content key={m} component={ContentVariants.li}>
                      {m}
                    </Content>
                  ))}
                </React.Fragment>
              );
            } else {
              return (
                <React.Fragment key={c.type}>
                  <Content component={ContentVariants.li}>
                    <strong>{c.type}</strong>
                  </Content>
                  <Content component={ContentVariants.li}>{c.reason || ''}</Content>
                </React.Fragment>
              );
            }
          })}
        </Content>
      </Content>
    </Alert>
  );
};
