import React from 'react';
import { ButtonVariant } from '@patternfly/react-core';
import { EventsModalButton } from './eventsModal';
import { MonitoringIcon } from '@patternfly/react-icons';
import { Cluster } from '@openshift-assisted/types/assisted-installer-service';
import { EventListFetchProps } from '../../types';
import { useTranslation } from '../../hooks/use-translation-wrapper';

type ViewClusterEventsProps = {
  cluster: Cluster;
  onFetchEvents: EventListFetchProps['onFetchEvents'];
};

const ViewClusterEventsButton = ({ cluster, onFetchEvents }: ViewClusterEventsProps) => {
  const { t } = useTranslation();
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
      {t('ai:View cluster events')}
    </EventsModalButton>
  );
};

export default ViewClusterEventsButton;
