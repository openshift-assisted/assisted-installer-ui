import React from 'react';
import PageSection from '../PageSection';
import { AlertGroup, AlertActionCloseButton, Alert } from '@patternfly/react-core';
import { AlertProps, removeAlert } from '../../../features/alerts/alertsSlice';

import './AlertsSection.css';
import { AlertsContext } from '../../AlertsContextProvider';

const AlertsSection: React.FC = () => {
  const { alerts, dispatchAlertsAction } = React.useContext(AlertsContext);
  const onClose = (alert: AlertProps) => dispatchAlertsAction(removeAlert(alert.key));

  if (alerts.length) {
    return (
      <PageSection padding={{ default: 'noPadding' }}>
        <AlertGroup className="alerts-section">
          {alerts.map((alert) => (
            // eslint-disable-next-line react/jsx-key
            <Alert
              actionClose={<AlertActionCloseButton onClose={() => onClose(alert)} />}
              {...alert}
            >
              {alert.message}
            </Alert>
          ))}
        </AlertGroup>
      </PageSection>
    );
  }
  return null;
};

export default AlertsSection;
