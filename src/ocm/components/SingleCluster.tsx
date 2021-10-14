import React from 'react';
import { Redirect, RouteComponentProps } from 'react-router-dom';
import { PageSectionVariants, PageSection } from '@patternfly/react-core';
import { Cluster, ErrorState, LoadingState } from '../../common';
import { routeBasePath } from '../config';
import { NewClusterPage } from './clusters';
import { useClustersList } from '../hooks';

const reducer = (state, action) => {
  switch (action.type) {
    case 'clusters/fetch':
  }
};

const SingleCluster: React.FC<SingleClusterProps> = () => {
  const [internalClusters, dispatch] = React.useReducer(reducer);
  const { error, loading, clusters } = useClustersList([]);
  setInternalClusters(clusters || []);

  const handleFetchData = React.useCallback(() => void dispatch('clusters/fetch'), []);

  if (error) {
    return (
      <PageSection variant={PageSectionVariants.light} isFilled>
        <ErrorState title="Failed to fetch cluster." fetchData={handleFetchData} />
      </PageSection>
    );
  }

  if (loading) {
    return (
      <PageSection variant={PageSectionVariants.light} isFilled>
        <LoadingState />
      </PageSection>
    );
  }

  if (internalClusters?.length === 0) {
    return <NewClusterPage />;
  } else if (internalClusters?.length > 1) {
    // TODO(mlibra): What about Day2 cluster in single-cluster flow?
    console.warn('More than one cluster found!', internalClusters);
  }

  return <Redirect to={`${routeBasePath}/clusters/${internalClusters[0].id}`} />;
};

export default SingleCluster;

type SingleClusterProps = RouteComponentProps;
