import React from 'react';
import { AlertProps, AlertPayload, alertsSlice } from '../reducers';
import { useTranslation } from '../../common/hooks/use-translation-wrapper';

const {
  addAlert: addAlertAction,
  removeAlert: removeAlertAction,
  clearAlerts: clearAlertsAction,
} = alertsSlice.actions;
const alertsReducer = alertsSlice.reducer;

export type AlertsContextType = {
  alerts: AlertProps[];
  addAlert: (alert: AlertPayload) => void;
  removeAlert: (alertKey: string) => void;
  clearAlerts: () => void;
};

const AlertsContext = React.createContext<AlertsContextType | null>(null);

export const AlertsContextProvider: React.FC = ({ children }) => {
  const [alerts, dispatch] = React.useReducer(alertsReducer, []);
  const context = {
    alerts,
    addAlert: React.useCallback((alert: AlertPayload) => dispatch(addAlertAction(alert)), []),
    removeAlert: React.useCallback((alertKey: string) => dispatch(removeAlertAction(alertKey)), []),
    clearAlerts: React.useCallback(() => dispatch(clearAlertsAction()), []),
  };
  return <AlertsContext.Provider value={context}>{children}</AlertsContext.Provider>;
};

export const useAlerts = () => {
  const context = React.useContext(AlertsContext);
  const { t } = useTranslation();
  if (!context) {
    throw new Error(t('ai:useAlerts must be used within AlertsContextProvider'));
  }
  return context;
};
