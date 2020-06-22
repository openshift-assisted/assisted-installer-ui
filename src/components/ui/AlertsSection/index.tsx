import React from 'react';
import PageSection from '../PageSection';
import { AlertGroup, AlertActionCloseButton, Alert } from '@patternfly/react-core';
import { AlertProps } from '../../../features/alerts/alertsSlice';

import './AlertsSection.css';

type AlertsSectionProps = {
  alerts: AlertProps[];
  onClose: (alert: AlertProps) => void;
};

const AlertsSection: React.FC<AlertsSectionProps> = ({ alerts, onClose }) => (
  <PageSection noPadding>
    <AlertGroup className="alerts-section">
      {alerts.map((alert) => (
        // eslint-disable-next-line react/jsx-key
        <Alert action={<AlertActionCloseButton onClose={() => onClose(alert)} />} {...alert}>
          {alert.message}
        </Alert>
      ))}
    </AlertGroup>
  </PageSection>
);

export default AlertsSection;
