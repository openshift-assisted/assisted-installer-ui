import { getEnabledHosts } from '../hosts';
import { RenderIf } from '../ui';
import { Grid, GridItem } from '@patternfly/react-core';
import { ProgressBarTexts } from './ProgressBarTexts';
import { FinalizingProgress } from './FinalizingProgress';
import OperatorsProgressItem from './OperatorsProgressItem';
import React from 'react';
import { Cluster } from '../../api';
import { EventListFetchProps } from '../../types';
import { selectOlmOperators } from '../../../common';

type ClusterProgressItemsProps = {
  cluster: Cluster;
  minimizedView?: boolean;
  onFetchEvents: EventListFetchProps['onFetchEvents'];
  totalPercentage?: number;
  fallbackEventsURL?: string;
};

const ClusterProgressItems = ({
  cluster,
  minimizedView = false,
  onFetchEvents,
  fallbackEventsURL,
}: ClusterProgressItemsProps) => {
  const enabledHosts = getEnabledHosts(cluster.hosts);
  const olmOperators = selectOlmOperators(cluster);

  const masterHosts = enabledHosts.filter((host) => host.role && 'master' === host.role);
  const workerHosts = enabledHosts.filter((host) => host.role && 'worker' === host.role);

  return (
    <>
      <RenderIf condition={!minimizedView}>
        <Grid hasGutter>
          <GridItem span={3}>
            <ProgressBarTexts hosts={masterHosts} hostRole="master" />
          </GridItem>
          <RenderIf condition={workerHosts.length > 0}>
            <GridItem span={3}>
              <ProgressBarTexts hosts={workerHosts} hostRole="worker" />
            </GridItem>
          </RenderIf>
          <GridItem span={3}>
            <FinalizingProgress
              cluster={cluster}
              onFetchEvents={onFetchEvents}
              fallbackEventsURL={fallbackEventsURL}
            />
          </GridItem>
          <RenderIf condition={olmOperators.length > 0}>
            <GridItem span={3}>
              <OperatorsProgressItem operators={olmOperators} />
            </GridItem>
          </RenderIf>
        </Grid>
      </RenderIf>
    </>
  );
};

export default ClusterProgressItems;
