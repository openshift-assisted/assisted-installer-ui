import React from 'react';
import { Redirect } from 'react-router-dom';
import { PageSectionVariants, PageSection } from '@patternfly/react-core';
import { Cluster, ErrorState, LoadingState } from '../../common';
import { routeBasePath } from '../config';
import { NewClusterPage } from './clusters';
import { ClustersAPI } from '../services/apis';
import { handleApiError } from '../api';

const SingleCluster = () => {
  const [error, setError] = React.useState('');
  const [clusters, setClusters] = React.useState<Cluster[]>();

  const fetchClusters = React.useCallback(async () => {
    try {
      const { data } = await ClustersAPI.list();
      setClusters(data);
      setError('');
    } catch (e) {
      handleApiError(e, () => setError('Failed to fetch cluster.'));
    }
  }, [setClusters]);

  React.useEffect(() => {
    void fetchClusters();
  }, [fetchClusters]);

  if (error) {
    return (
      <PageSection variant={PageSectionVariants.light} isFilled>
        <ErrorState title="Failed to fetch cluster." fetchData={fetchClusters} />
      </PageSection>
    );
  }

  if (!clusters) {
    return (
      <PageSection variant={PageSectionVariants.light} isFilled>
        <LoadingState />
      </PageSection>
    );
  }

  if (clusters.length === 0) {
    return <NewClusterPage />;
  }

  if (clusters.length > 1) {
    // TODO(mlibra): What about Day2 cluster in single-cluster flow?
    console.warn('More than one cluster found!', clusters);
  }

  return <Redirect to={`${routeBasePath}/clusters/${clusters[0].id}`} />;
};

export default SingleCluster;
