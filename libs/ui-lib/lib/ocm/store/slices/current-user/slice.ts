import type { PayloadAction, SerializedError } from '@reduxjs/toolkit';
import type { Account, Capability } from '@openshift-assisted/types/accounts-management-service';
import type { StateSliceWithMeta } from '../../types/state-slice';
import type { RootStateDay1 } from '../../store-day1';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { CurrentAccountApi } from '../../../../common/api/accounts-management-service/current-account-api';
import { OrganizationsApi } from '../../../../common/api/accounts-management-service/organizations-api';

const currentUserAsyncActions = {
  getAccountAsync: createAsyncThunk('currentUser/getAccountAsync', async (_, thunkApi) => {
    const account = await CurrentAccountApi.getCurrentAccount();
    if (account) {
      thunkApi.dispatch(currentUserActions.setAccount(account));
      await thunkApi.dispatch(currentUserAsyncActions.getUserOrganizationWithCapabilitiesAsync());
    } else {
      thunkApi.rejectWithValue({
        message: 'No account data available',
      } as SerializedError);
    }
  }),

  getUserOrganizationWithCapabilitiesAsync: createAsyncThunk(
    'currentUser/getUserOrganizationWithCapabilitiesAsync',
    async (_, thunkApi) => {
      const { currentUser } = thunkApi.getState() as RootStateDay1;
      const orgId = currentUser.data?.organization_id;
      if (orgId) {
        const organization = await OrganizationsApi.getOrganization(orgId);
        if (organization) {
          thunkApi.dispatch(
            currentUserActions.setOrganizationCapabilities(organization.capabilities ?? []),
          );
        } else {
          thunkApi.rejectWithValue({
            message: 'No organization data found',
          } as SerializedError);
        }
      } else {
        thunkApi.rejectWithValue({
          message: 'Account has no organization ID',
        } as SerializedError);
      }
    },
  ),

  getCapabilitiesAsync: createAsyncThunk(
    'currentUser/getCapabilitiesAsync',
    async (_, thunkApi) => {
      await thunkApi.dispatch(currentUserAsyncActions.getAccountAsync());
      await thunkApi.dispatch(currentUserAsyncActions.getUserOrganizationWithCapabilitiesAsync());
    },
  ),
};

type AsyncThunkActions = (typeof currentUserAsyncActions)[keyof typeof currentUserAsyncActions];
type CurrentUserAsyncThunkActionCreators =
  | ReturnType<AsyncThunkActions['pending']>
  | ReturnType<AsyncThunkActions['fulfilled']>
  | ReturnType<AsyncThunkActions['rejected']>;

export type CurrentUserState = StateSliceWithMeta<
  Omit<Account, 'capabilities'> | null,
  SerializedError | null
>;

const currentUserSlice = createSlice({
  name: 'currentUser',
  initialState: (): CurrentUserState => ({
    data: null,
    error: null,
    meta: {
      status: 'idle',
      updatedAt: null,
      currentRequestId: null,
    },
  }),
  reducers: {
    setMeta: (state, action: PayloadAction<CurrentUserAsyncThunkActionCreators>) => {
      state.meta.updatedAt = new Date().toUTCString();
      state.meta.status = action.payload.meta.requestStatus;
      state.meta.currentRequestId = action.payload.meta.requestId;
      return state;
    },
    setAccount: (state, action: PayloadAction<Account>) => {
      state.data = action.payload;
      state.error = null;
      state.meta.updatedAt = new Date().toUTCString();
      return state;
    },
    setOrganizationCapabilities: (state, action: PayloadAction<Capability[]>) => {
      if (state.data !== null && state.data.organization) {
        state.data.organization.capabilities = action.payload;
        state.error = null;
        state.meta.updatedAt = new Date().toUTCString();
      }

      return state;
    },
  },
  extraReducers: (builder) => {
    for (const { pending, fulfilled, rejected } of Object.values(currentUserAsyncActions)) {
      builder.addCase(pending, (state, action) => {
        if (/idle|fulfilled|rejected/.test(state.meta.status)) {
          currentUserActions.setMeta(action);
        }
        return state;
      });
      builder.addCase(fulfilled, (state, action) => {
        if (/pending/.test(state.meta.status)) {
          currentUserActions.setMeta(action);
        }
        return state;
      });
      builder.addCase(rejected, (state, action) => {
        if (/pending/.test(state.meta.status)) {
          currentUserActions.setMeta(action);
          state.error = action.error;
        }
        return state;
      });
    }
  },
});

const currentUserActions = currentUserSlice.actions;
const currentUserReducer = currentUserSlice.reducer;

export { currentUserAsyncActions, currentUserActions, currentUserReducer };
