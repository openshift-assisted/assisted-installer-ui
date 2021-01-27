import React from 'react';
import { Cluster, ManagedDomain } from '../../api/types';
import { getManagedDomains } from '../../api/domains';
import { handleApiError, getErrorMessage } from '../../api/utils';
import LoadingState from '../ui/uiState/LoadingState';
import ClusterConfigurationForm from './ClusterConfigurationForm';
import { AlertsContext } from '../AlertsContextProvider';

type ClusterConfigurationProps = {
  cluster: Cluster;
};
const ClusterConfiguration: React.FC<ClusterConfigurationProps> = ({ cluster }) => {
  const [domains, setDomains] = React.useState<ManagedDomain[] | undefined>();
  const { addAlert } = React.useContext(AlertsContext);

  React.useEffect(() => {
    let mounted = true;
    const fetchManagedDomains = async () => {
      try {
        const { data } = await getManagedDomains();
        if (mounted) setDomains(data);
      } catch (e) {
        if (mounted) setDomains([]);
        handleApiError(e, () =>
          addAlert({ title: 'Failed to retrieve managed domains', message: getErrorMessage(e) }),
        );
      }
    };
    fetchManagedDomains();

    return () => {
      mounted = false;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (domains) {
    return <ClusterConfigurationForm cluster={cluster} managedDomains={domains} />;
  }
  return <LoadingState content="Loading configuration..." />;
};

export default ClusterConfiguration;
