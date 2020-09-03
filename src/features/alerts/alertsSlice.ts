import { v4 as uuidv4 } from 'uuid';
import * as ReduxToolkit from '@reduxjs/toolkit';
import { AlertVariant } from '@patternfly/react-core';

// workaround for TS2742 issue
const { createSlice } = ReduxToolkit;

export type AlertPayload = {
  title: string;
  message?: string;
  variant?: AlertVariant;
};

export type AlertProps = {
  key: string;
  title: string;
  variant: AlertVariant;
  message?: string;
};

const initialState: AlertProps[] = [];

export const alertsSlice: ReduxToolkit.Slice = createSlice({
  initialState,
  name: 'alerts',
  reducers: {
    addAlert: (state, action: ReduxToolkit.PayloadAction<AlertPayload>) => [
      { key: uuidv4(), variant: AlertVariant.danger, ...action.payload },
      ...state,
    ],
    removeAlert: (state, action: ReduxToolkit.PayloadAction<string>) =>
      state.filter((alert) => alert.key !== action.payload),
    clearAlerts: () => initialState,
  },
});

export const clearAlerts = () => alertsSlice.actions.clearAlerts(null);
export const { addAlert, removeAlert } = alertsSlice.actions;
export default alertsSlice.reducer;
