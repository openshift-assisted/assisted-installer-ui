import { v4 as uuidv4 } from 'uuid';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AlertVariant } from '@patternfly/react-core';

type AlertPayload = {
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

export const alertsSlice = createSlice({
  initialState,
  name: 'alerts',
  reducers: {
    addAlert: (state, action: PayloadAction<AlertPayload>) => [
      { key: uuidv4(), variant: AlertVariant.danger, ...action.payload },
      ...state,
    ],
    removeAlert: (state, action: PayloadAction<string>) =>
      state.filter((alert) => alert.key !== action.payload),
  },
});

export const { addAlert, removeAlert } = alertsSlice.actions;
export default alertsSlice.reducer;
