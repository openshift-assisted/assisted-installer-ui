import React, { useEffect } from 'react';
import { getErrorMessage, handleApiError } from '../../api/utils';
import { getOpenshiftVersions } from '../../api/versions';
import { AlertPayload } from '../../features/alerts/alertsSlice';
import { OpenshiftVersionOptionType } from '../../types/versions';

type State<DataType> = {
  status: 'loading' | 'succeeded' | 'failed';
  data?: DataType;
  error?: AlertPayload;
};
type Action<DataType> =
  | { type: 'request' }
  | { type: 'success'; data: DataType }
  | { type: 'failure'; data: DataType; error: AlertPayload };

const reducer: React.Reducer<
  State<OpenshiftVersionOptionType[]>,
  Action<OpenshiftVersionOptionType[]>
> = (state, action) => {
  switch (action.type) {
    case 'request':
      return { status: 'loading' };
    case 'success':
      return { status: 'succeeded', data: action.data };
    case 'failure':
      return { status: 'failed', data: action.data, error: action.error };
    default:
      return state;
  }
};

const useFetchOpenShiftVersions = () => {
  const [state, dispatch] = React.useReducer(reducer, { status: 'loading', data: undefined });

  const fetchOpenShiftVersions = async () => {
    dispatch({ type: 'request' });
    try {
      const { data } = await getOpenshiftVersions();
      const versions: OpenshiftVersionOptionType[] = Object.keys(data)
        .sort()
        .map((key) => ({
          label: `OpenShift ${data[key].displayName || key}`,
          value: key,
          supportLevel: data[key].supportLevel,
        }));
      dispatch({ type: 'success', data: versions });
    } catch (e) {
      handleApiError(e);
      dispatch({
        type: 'failure',
        data: [],
        error: {
          title: 'Failed to retrieve the default configuration',
          message: getErrorMessage(e),
        },
      });
    }
  };

  useEffect(() => {
    fetchOpenShiftVersions();
  }, []);

  return {
    openShiftVersions: state.data,
    status: state.status,
    error: state.error,
    fetchOpenShiftVersions,
  };
};

type OpenShiftVersionsContextType = {
  openShiftVersions: OpenshiftVersionOptionType[];
};
const OpenShiftVersionsContext = React.createContext<OpenShiftVersionsContextType | undefined>(
  undefined,
);

const OpenShiftVersionsProvider: React.FC<{ openShiftVersions: OpenshiftVersionOptionType[] }> = ({
  children,
  openShiftVersions,
}) => {
  return (
    <OpenShiftVersionsContext.Provider value={{ openShiftVersions }}>
      {children}
    </OpenShiftVersionsContext.Provider>
  );
};

const useOpenShiftVersions = () => {
  const context = React.useContext(OpenShiftVersionsContext);
  if (context === undefined) {
    throw new Error('useOpenShiftVersions must be used within OpenShiftVersionsContextProvider');
  }
  return context;
};

export { OpenShiftVersionsProvider, useOpenShiftVersions, useFetchOpenShiftVersions };
