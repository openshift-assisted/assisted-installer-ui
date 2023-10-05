import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { NewFeatureSupportLevelMap } from '../../../../common/components/newFeatureSupportLevels/types';

const featureSupportLevelsSlice = createSlice({
  name: 'featureSupportLevelsReducer',
  initialState: {} as NewFeatureSupportLevelMap,
  reducers: {
    setFeatureSupportLevels: (state, action: PayloadAction<NewFeatureSupportLevelMap>) => {
      return Object.assign(state, action.payload);
    },
  },
});

export const featureSupportLevelsReducersActions = featureSupportLevelsSlice.actions;
export const featureSupportLevelsReducer = featureSupportLevelsSlice.reducer;
