import React from 'react';
import { Redirect, RouteComponentProps } from 'react-router-dom';
import { PageSectionVariants } from '@patternfly/react-core';
import { Cluster, getClusters, handleApiError } from '../api';
import { ErrorState, LoadingState, PageSection } from './ui';
import { routeBasePath } from '../config';
import { NewClusterPage } from './clusters';

type SingleClusterProps = RouteComponentProps;

const SingleCluster: React.FC<SingleClusterProps> = () => {
  const [error, setError] = React.useState('');
  const [clusters, setClusters] = React.useState<Cluster[]>();

  const fetchClusters = React.useCallback(async () => {
    try {
      const { data } = await getClusters();
      setClusters(data);
    } catch (e) {
      return handleApiError(e, () => setError('Failed to fetch cluster.'));
    }
  }, [setClusters]);

  React.useEffect(() => {
    fetchClusters();
  }, [fetchClusters]);

  if (error) {
    return (
      <PageSection variant={PageSectionVariants.light} isMain>
        <ErrorState title="Failed to fetch cluster." fetchData={fetchClusters} />
      </PageSection>
    );
  }

  if (!clusters) {
    return (
      <PageSection variant={PageSectionVariants.light} isMain>
        <LoadingState />
      </PageSection>
    );
  }

  if (clusters.length === 0) {
    return <NewClusterPage />;
  }

  if (clusters.length > 1) {
    console.warn('More than one cluster found!', clusters);
  }

  return <Redirect to={`${routeBasePath}/clusters/${clusters[0].id}`} />;
};

export default SingleCluster;
