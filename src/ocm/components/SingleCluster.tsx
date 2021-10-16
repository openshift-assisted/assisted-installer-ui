import React from 'react';
import { Redirect, RouteComponentProps } from 'react-router-dom';
import { PageSectionVariants, PageSection } from '@patternfly/react-core';
import { ErrorState, LoadingState } from '../../common';
import { routeBasePath } from '../config';
import { NewClusterPage } from './clusters';
import { useClustersList } from '../hooks';

type SingleClusterProps = RouteComponentProps;

const SingleCluster: React.FC<SingleClusterProps> = () => {
  const retryFlag = React.useRef<{ state: boolean }>({ state: false });
  const { error, clusters } = useClustersList([retryFlag.current.state]);

  const handleFetchData = () => {
    retryFlag.current.state = !retryFlag.current.state;
  };

  if (error) {
    return (
      <PageSection variant={PageSectionVariants.light} isFilled>
        <ErrorState title="Failed to fetch cluster." fetchData={handleFetchData} />
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

  if (clusters && clusters.length > 1) {
    // TODO(mlibra): What about Day2 cluster in single-cluster flow?
    console.warn('More than one cluster found!', clusters);
  }

  return <Redirect to={`${routeBasePath}/clusters/${clusters[0].id}`} />;
};

export default SingleCluster;
