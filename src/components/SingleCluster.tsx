import React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { PageSectionVariants } from '@patternfly/react-core';
import { Cluster, getClusters, handleApiError } from '../api';
import { ErrorState, LoadingState, PageSection } from './ui';
import { routeBasePath } from '../config';

type SingleClusterProps = RouteComponentProps;

const SingleCluster: React.FC<SingleClusterProps> = ({ history }) => {
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

  React.useEffect(() => {
    if (clusters) {
      if (clusters.length === 0) {
        history.push(`${routeBasePath}/clusters/~new`);
        return;
      }

      if (clusters.length > 1) {
        console.warn('More than one cluster found!', clusters);
      }

      history.push(`${routeBasePath}/clusters/${clusters[0].id}`);
    }
  }, [clusters, history]);

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

  return <div>Redirecting to cluster detail</div>;
};

export default SingleCluster;
