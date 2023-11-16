import { createSlice } from '@reduxjs/toolkit';

const ocmInfoSlice = createSlice({
  name: 'ocmInfo',
  initialState: [],
  reducers: {},
  isOcm: boolean,
});

export const ocmInfoActions = ocmInfoSlice.actions;
export const ocmInfoReducer = ocmInfoSlice.reducer;
