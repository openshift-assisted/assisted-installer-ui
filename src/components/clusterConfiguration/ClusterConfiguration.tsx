import React from 'react';
import { PageSectionVariants } from '@patternfly/react-core';
import { Cluster, ManagedDomain } from '../../api/types';
import { getManagedDomains } from '../../api/domains';
import { handleApiError, getErrorMessage } from '../../api/utils';
import LoadingState from '../ui/uiState/LoadingState';
import ClusterConfigurationForm from './ClusterConfigurationForm';
import PageSection from '../ui/PageSection';
import alertsReducer, { addAlert } from '../../features/alerts/alertsSlice';

type ClusterConfigurationProps = {
  cluster: Cluster;
};
const ClusterConfiguration: React.FC<ClusterConfigurationProps> = ({ cluster }) => {
  const [alerts, dispatchAlertsAction] = React.useReducer(alertsReducer, []);
  const [domains, setDomains] = React.useState<ManagedDomain[] | undefined>();

  React.useEffect(() => {
    const fetchManagedDomains = async () => {
      try {
        const { data } = await getManagedDomains();
        setDomains(data);
      } catch (e) {
        setDomains([]);
        handleApiError(e, () =>
          dispatchAlertsAction(
            addAlert({ title: 'Failed to retrieve managed domains', message: getErrorMessage(e) }),
          ),
        );
      }
    };
    fetchManagedDomains();
  }, []);

  if (domains) {
    return (
      <ClusterConfigurationForm
        cluster={cluster}
        managedDomains={domains}
        alerts={alerts}
        dispatchAlertsAction={dispatchAlertsAction}
      />
    );
  }
  return (
    <PageSection variant={PageSectionVariants.light} isMain>
      <LoadingState content="Loading configuration..." />
    </PageSection>
  );
};

export default ClusterConfiguration;
