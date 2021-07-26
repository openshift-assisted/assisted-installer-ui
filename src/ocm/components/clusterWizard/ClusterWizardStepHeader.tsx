import React from 'react';
import { Split, SplitItem, Text, TextContent, ButtonVariant } from '@patternfly/react-core';
import { Cluster, EventsModalButton } from '../../../common';
import { onFetchEvents } from '../fetching/fetchEvents';

const ClusterWizardStepHeader: React.FC<{ cluster?: Cluster }> = ({ cluster, children }) => {
  return (
    <Split>
      <SplitItem>
        <TextContent>
          <Text component="h2">{children}</Text>
        </TextContent>
      </SplitItem>
      <SplitItem isFilled />
      {cluster && (
        <SplitItem>
          <EventsModalButton
            id="cluster-events-button"
            entityKind="cluster"
            cluster={cluster}
            title="Cluster events"
            variant={ButtonVariant.secondary}
            onFetchEvents={onFetchEvents}
          >
            View cluster events
          </EventsModalButton>
        </SplitItem>
      )}
    </Split>
  );
};

export default ClusterWizardStepHeader;
