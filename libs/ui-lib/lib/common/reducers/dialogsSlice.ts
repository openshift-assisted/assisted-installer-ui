import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type DialogPayload = {
  dialogId: string;
  data?: unknown;
};

const initialState: Record<string, unknown> = {};

export const dialogsSlice = createSlice({
  initialState,
  name: 'alerts',
  reducers: {
    openDialog: (state, action: PayloadAction<DialogPayload>) => {
      state[action.payload.dialogId] = action.payload.data || {};
      return state;
    },
    closeDialog: (state, action: PayloadAction<DialogPayload>) => {
      state[action.payload.dialogId] = undefined;
      return state;
    },
  },
});
