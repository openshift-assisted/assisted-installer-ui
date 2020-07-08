import React from 'react';
import { AnyAction } from 'redux';
import alertsReducer, {
  AlertProps,
  addAlert as addAlertAction,
  AlertPayload,
} from '../features/alerts/alertsSlice';

type AlertsContextType = {
  alerts: AlertProps[];
  dispatchAlertsAction: React.Dispatch<AnyAction>;
  addAlert: (alert: AlertPayload) => void;
};

export const AlertsContext = React.createContext<AlertsContextType>({
  alerts: [],
  dispatchAlertsAction: () => null,
  addAlert: () => null,
});

export const AlertsContextProvider: React.FC = ({ children }) => {
  const [alerts, dispatchAlertsAction] = React.useReducer(alertsReducer, []);
  const addAlert = (alert: AlertPayload) => dispatchAlertsAction(addAlertAction(alert));
  return (
    <AlertsContext.Provider value={{ alerts, dispatchAlertsAction, addAlert }}>
      {children}
    </AlertsContext.Provider>
  );
};
