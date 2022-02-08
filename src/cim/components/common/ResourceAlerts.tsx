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
      <TextContent>
        <TextList component={TextListVariants.ul}>
          {conditions.map((c) => {
            const [title, ...messages] = c.message.split(/:|\.,/);
            return (
              <React.Fragment key={title}>
                <TextListItem component={TextListItemVariants.li}>
                  <strong>{title}</strong>
                </TextListItem>
                {messages.map((m) => (
                  <TextListItem key={m} component={TextListItemVariants.li}>
                    {m}
                  </TextListItem>
                ))}
              </React.Fragment>
            );
          })}
        </TextList>
      </TextContent>
    </Alert>
  );
};
