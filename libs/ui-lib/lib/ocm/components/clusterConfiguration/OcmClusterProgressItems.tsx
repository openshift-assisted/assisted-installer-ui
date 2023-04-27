import { Grid, GridItem } from '@patternfly/react-core';
import React from 'react';
import {
  Cluster,
  EventListFetchProps,
  getEnabledHosts,
  RenderIf,
  selectOlmOperators,
} from '../../../common';
import { FinalizingProgress } from '../../../common/components/clusterDetail/FinalizingProgress';
import { ProgressBarTexts } from '../../../common/components/clusterDetail/ProgressBarTexts';
import OcmOperatorsProgressItem from './OcmOperatorProgressItem';

type OcmClusterProgressItemsProps = {
  cluster: Cluster;
  minimizedView?: boolean;
  onFetchEvents: EventListFetchProps['onFetchEvents'];
  totalPercentage?: number;
  fallbackEventsURL?: string;
};

const OcmClusterProgressItems = ({
  cluster,
  minimizedView = false,
  onFetchEvents,
  fallbackEventsURL,
}: OcmClusterProgressItemsProps) => {
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
              <OcmOperatorsProgressItem
                operators={olmOperators}
                openshiftVersion={cluster.openshiftVersion}
              />
            </GridItem>
          </RenderIf>
        </Grid>
      </RenderIf>
    </>
  );
};

export default OcmClusterProgressItems;
