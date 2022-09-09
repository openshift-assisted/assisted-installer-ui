import React from 'react';
import { ButtonVariant } from '@patternfly/react-core';
import { EventsModalButton } from './eventsModal';
import { MonitoringIcon } from '@patternfly/react-icons';
import { Cluster } from '../../api';
import { EventListFetchProps } from '../../types';

type ViewClusterEventsProps = {
  cluster: Cluster;
  onFetchEvents: EventListFetchProps['onFetchEvents'];
};

const ViewClusterEventsButton = ({ cluster, onFetchEvents }: ViewClusterEventsProps) => {
  return (
    <EventsModalButton
      id="cluster-events-button"
      entityKind="cluster"
      icon={<MonitoringIcon />}
      cluster={cluster}
      title="Cluster Events"
      variant={ButtonVariant.secondary}
      onFetchEvents={onFetchEvents}
    >
      View Cluster Events
    </EventsModalButton>
  );
};

export default ViewClusterEventsButton;
