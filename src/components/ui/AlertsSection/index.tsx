import React from 'react';
import { AlertGroup, AlertActionCloseButton, Alert } from '@patternfly/react-core';
import PageSection from '../PageSection';
import { AlertProps } from '../../../features/alerts/alertsSlice';
import { AlertsContext } from '../../AlertsContextProvider';

import './AlertsSection.css';

export const AlertsSectionGroup: React.FC<{ className?: string }> = ({ className }) => {
  const { alerts, removeAlert } = React.useContext(AlertsContext);
  const onClose = (alert: AlertProps) => removeAlert(alert.key);

  if (alerts.length) {
    return (
      <AlertGroup className={className}>
        {alerts.map((alert) => (
          // eslint-disable-next-line react/jsx-key
          <Alert actionClose={<AlertActionCloseButton onClose={() => onClose(alert)} />} {...alert}>
            {alert.message}
          </Alert>
        ))}
      </AlertGroup>
    );
  }
  return null;
};

const AlertsSection: React.FC = () => {
  const { alerts } = React.useContext(AlertsContext);
  if (alerts.length) {
    return (
      <PageSection padding={{ default: 'noPadding' }}>
        <AlertsSectionGroup className="alerts-section" />
      </PageSection>
    );
  }
  return null;
};

export default AlertsSection;
