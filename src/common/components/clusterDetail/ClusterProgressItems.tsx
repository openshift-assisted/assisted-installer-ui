import { getEnabledHosts } from '../hosts';
import { RenderIf } from '../ui';
import { Grid, GridItem } from '@patternfly/react-core';
import { ProgressBarTexts } from './ProgressBarTexts';
import { FinalizingProgress } from './FinalizingProgress';
import OperatorsProgressItem from './OperatorsProgressItem';
import React from 'react';
import { Cluster } from '../../api';
import { EventListFetchProps } from '../../types';
import { getOlmOperators } from '../../../common';

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
  const isWorkersPresent = enabledHosts && enabledHosts.some((host) => host.role === 'worker');
  const olmOperators = getOlmOperators(cluster.monitoredOperators);

  return (
    <>
      <RenderIf condition={!minimizedView}>
        <Grid hasGutter>
          <GridItem span={3}>
            <ProgressBarTexts hosts={enabledHosts} hostRole="master" />
          </GridItem>
          <RenderIf condition={isWorkersPresent}>
            <GridItem span={3}>
              <ProgressBarTexts hosts={enabledHosts} hostRole="worker" />
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
