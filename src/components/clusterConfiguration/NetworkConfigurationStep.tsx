import React from 'react';
import { Cluster, ManagedDomain } from '../../api/types';
import { getManagedDomains } from '../../api/domains';
import { handleApiError, getErrorMessage } from '../../api/utils';
import LoadingState from '../ui/uiState/LoadingState';
import NetworkConfigurationForm from './NetworkConfigurationForm';
import { AlertsContext } from '../AlertsContextProvider';

const NetworkConfigurationStep: React.FC<{
  cluster: Cluster;
}> = ({ cluster }) => {
  const [domains, setDomains] = React.useState<ManagedDomain[] | undefined>();
  const { addAlert } = React.useContext(AlertsContext);

  React.useEffect(() => {
    const fetchManagedDomains = async () => {
      try {
        const { data } = await getManagedDomains();
        setDomains(data);
      } catch (e) {
        setDomains([]);
        handleApiError(e, () =>
          addAlert({ title: 'Failed to retrieve managed domains', message: getErrorMessage(e) }),
        );
      }
    };
    fetchManagedDomains();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (domains) {
    return <NetworkConfigurationForm cluster={cluster} managedDomains={domains} />;
  }
  return <LoadingState content="Loading configuration..." />;
};

export default NetworkConfigurationStep;
