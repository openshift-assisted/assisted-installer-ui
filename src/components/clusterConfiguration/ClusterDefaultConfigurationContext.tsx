import _ from 'lodash';
import React, { useContext, useEffect, useState } from 'react';
import { handleApiError, getErrorMessage } from '../../api';
import { getClustersDefaultConfiguration } from '../../api/clusters';
import { ClusterDefaultConfig } from '../../api/types';
import { AlertsContext } from '../AlertsContextProvider';

export const ClusterDefaultConfigurationContext = React.createContext<ClusterDefaultConfig>({});

export const ClusterDefaultConfigurationProvider: React.FC = ({ children }) => {
  const [defaultConfiguration, setDefaultConfiguration] = useState<ClusterDefaultConfig>({});
  const { addAlert } = React.useContext(AlertsContext);

  useEffect(() => {
    let mounted = true;
    const fetchAndSetDefaultConfiguration = async () => {
      try {
        const { data } = await getClustersDefaultConfiguration();
        if (mounted) {
          setDefaultConfiguration(data);
        }
      } catch (e) {
        handleApiError(e, () =>
          addAlert({
            title: 'Failed to retrieve the default configuration',
            message: getErrorMessage(e),
          }),
        );
      }
    };
    fetchAndSetDefaultConfiguration();

    return () => {
      mounted = false;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <ClusterDefaultConfigurationContext.Provider value={defaultConfiguration}>
      {children}
    </ClusterDefaultConfigurationContext.Provider>
  );
};

export const useDefaultConfiguration = (keys: Array<keyof ClusterDefaultConfig>) => {
  return _.pick(useContext(ClusterDefaultConfigurationContext), keys);
};
