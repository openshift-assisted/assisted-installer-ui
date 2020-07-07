import React from 'react';
import { PageSectionVariants } from '@patternfly/react-core';
import { Cluster, ManagedDomain } from '../../api/types';
import { getManagedDomains } from '../../api/domains';
import { handleApiError } from '../../api/utils';
import LoadingState from '../ui/uiState/LoadingState';
import ClusterConfigurationForm from './ClusterConfigurationForm';
import PageSection from '../ui/PageSection';

type ClusterConfigurationProps = {
  cluster: Cluster;
};
const ClusterConfiguration: React.FC<ClusterConfigurationProps> = ({ cluster }) => {
  const [domains, setDomains] = React.useState<ManagedDomain[] | undefined>();

  React.useEffect(() => {
    const fetchManagedDomains = async () => {
      try {
        const { data } = await getManagedDomains();
        setDomains(data);
      } catch (e) {
        setDomains([]);
        handleApiError(e);
      }
    };
    fetchManagedDomains();
  }, []);

  if (domains) {
    return <ClusterConfigurationForm cluster={cluster} managedDomains={domains} />;
  }
  return (
    <PageSection variant={PageSectionVariants.light} isMain>
      <LoadingState content="Loading configuration..." />
    </PageSection>
  );
};

export default ClusterConfiguration;
