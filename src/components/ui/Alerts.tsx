import React from 'react';
import { Alert, AlertActionCloseButton, AlertVariant, AlertGroup } from '@patternfly/react-core';

export type Alert = {
  variant: AlertVariant;
  text: string;
  key?: string;
  onClose?: () => void;
};

type AlertsProps = {
  alerts: Alert[];
  className?: string;
};

export const Alerts: React.FC<AlertsProps> = ({ alerts, className }) => {
  if (!alerts || alerts.length === 0) {
    return null;
  }
  return (
    <AlertGroup className={className}>
      {alerts.map((alert) => (
        <Alert
          key={alert.key || alert.text}
          variant={alert.variant}
          title={alert.text}
          action={alert.onClose ? <AlertActionCloseButton onClose={alert.onClose} /> : undefined}
        />
      ))}
    </AlertGroup>
  );
};
