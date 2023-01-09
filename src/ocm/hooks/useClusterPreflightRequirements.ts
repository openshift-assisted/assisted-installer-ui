import React from 'react';
import { alertsSlice } from '../../common/reducers';
import { Cluster, PreflightHardwareRequirements } from '../../common/api/types';
import { ClustersAPI } from '../services/apis';
import { getApiErrorMessage, handleApiError } from '../api';
import { getErrorMessage } from '../../common/utils';

const { addAlert } = alertsSlice.actions;

const useClusterPreflightRequirements = (clusterId: Cluster['id']) => {
  const [preflightRequirements, setPreflightRequirements] =
    React.useState<PreflightHardwareRequirements>();
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    const fetchFunc = async () => {
      try {
        const { data } = await ClustersAPI.getPreflightRequirements(clusterId);
        setPreflightRequirements(data);
      } catch (e) {
        setError(getErrorMessage(e));
        // report error systematically at one place show defaults instead
        handleApiError(e, () =>
          addAlert({
            title: 'Failed to retrieve preflight cluster requirements',
            message: getApiErrorMessage(e),
          }),
        );
      }
    };
    void fetchFunc();
  }, [setPreflightRequirements, setError, clusterId]);

  return {
    preflightRequirements,
    error,
    isLoading: !error && !preflightRequirements,
  };
};

export default useClusterPreflightRequirements;
