import { getEnabledHosts } from '../hosts';
import { getOlmOperators } from './utils';
import { RenderIf } from '../ui';
import { Flex, FlexItem } from '@patternfly/react-core';
import { ProgressBarTexts } from './ProgressBarTexts';
import { FinalizingProgress } from './FinalizingProgress';
import OperatorsProgressItem from './OperatorsProgressItem';
import React from 'react';
import { ClusterProgressProps } from './ClusterProgress';

const ClusterProgressItems = ({
  cluster,
  minimizedView = false,
  onFetchEvents,
  fallbackEventsURL,
}: ClusterProgressProps) => {
  const { monitoredOperators = [] } = cluster;
  const enabledHosts = getEnabledHosts(cluster.hosts);
  const isWorkersPresent = enabledHosts && enabledHosts.some((host) => host.role === 'worker');
  const olmOperators = getOlmOperators(monitoredOperators);

  return (
    <>
      <RenderIf condition={!minimizedView}>
        <Flex className="pf-u-mt-md">
          <FlexItem spacer={{ default: 'spacer4xl' }}>
            <ProgressBarTexts hosts={enabledHosts} hostRole="master" />
          </FlexItem>
          <FlexItem spacer={{ default: 'spacer2xl' }}></FlexItem>
          <RenderIf condition={isWorkersPresent}>
            <FlexItem spacer={{ default: 'spacer4xl' }}>
              <ProgressBarTexts hosts={enabledHosts} hostRole="worker" />
            </FlexItem>
            <FlexItem spacer={{ default: 'spacer2xl' }}></FlexItem>
          </RenderIf>
          <FlexItem spacer={{ default: 'spacer4xl' }}>
            <FinalizingProgress
              cluster={cluster}
              onFetchEvents={onFetchEvents}
              fallbackEventsURL={fallbackEventsURL}
            />
          </FlexItem>
          <FlexItem spacer={{ default: 'spacer2xl' }}></FlexItem>
          <RenderIf condition={olmOperators.length > 0}>
            <FlexItem>
              <OperatorsProgressItem operators={olmOperators} />
            </FlexItem>
          </RenderIf>
        </Flex>
      </RenderIf>
    </>
  );
};

export default ClusterProgressItems;
