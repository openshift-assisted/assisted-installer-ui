import React from 'react';
import { AlertGroup, Alert } from '@patternfly/react-core';
import { useAlerts } from '../AlertsContextProvider';

const Alerts = ({ className }: { className?: string }) => {

  const { alerts } = useAlerts();

  if (alerts.length) {
    return (
      <AlertGroup className={className}>
        {alerts.map((alert) => (
          // eslint-disable-next-line react/jsx-key
          <Alert isInline {...alert}>
            {alert.message}
          </Alert>
        ))}
      </AlertGroup>
    );
  }
  return null;
};

export default Alerts;
