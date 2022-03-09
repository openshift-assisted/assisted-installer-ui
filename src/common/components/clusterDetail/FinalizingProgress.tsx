import { Cluster } from '../../api/types';
import { EventListFetchProps } from '../../types';
import React from 'react';
import { EventsModal } from '../ui';
import {
  Button,
  ButtonVariant,
  Popover,
  Stack,
  StackItem,
  Text,
  TextContent,
} from '@patternfly/react-core';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  InProgressIcon,
  PendingIcon,
} from '@patternfly/react-icons';
import { global_success_color_100 as okColor } from '@patternfly/react-tokens/dist/esm/global_success_color_100';
import { global_danger_color_100 as dangerColor } from '@patternfly/react-tokens/dist/esm/global_danger_color_100';

type FinalizingProgressProps = {
  cluster: Cluster;
  onFetchEvents: EventListFetchProps['onFetchEvents'];
  fallbackEventsURL?: string;
};

const areAllBuiltInOperatorsAvailable = (
  monitoredOperators: Cluster['monitoredOperators'] = [],
) => {
  return monitoredOperators.length
    ? monitoredOperators
        .filter((op) => op.operatorType === 'builtin')
        .every((op) => op.status === 'available')
    : false;
};

export const getFinalizingStatus = (cluster: Cluster) => {
  let statusIcon, initializationStatus;
  if (areAllBuiltInOperatorsAvailable(cluster.monitoredOperators)) {
    statusIcon = <CheckCircleIcon color={okColor.value} />;
    initializationStatus = 'completed';
  } else {
    switch (cluster.status) {
      case 'finalizing':
        statusIcon = <InProgressIcon />;
        initializationStatus = 'finalizing';
        break;
      case 'error':
      case 'cancelled':
        statusIcon = <ExclamationCircleIcon color={dangerColor.value} />;
        initializationStatus = 'failed';
        break;
      case 'installed':
      case 'adding-hosts':
        statusIcon = <CheckCircleIcon color={okColor.value} />;
        initializationStatus = 'completed';
        break;
      default:
        statusIcon = <PendingIcon />;
        initializationStatus = 'pending';
    }
  }

  return [statusIcon, initializationStatus];
};

export const FinalizingProgress: React.FC<FinalizingProgressProps> = ({
  cluster,
  onFetchEvents,
  fallbackEventsURL,
}) => {
  const { status } = cluster;
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [finalizingIcon, initializationStatus] = getFinalizingStatus(cluster);
  const closeModal = () => setIsModalOpen(false);
  return (
    <>
      <EventsModal
        title="Cluster Events"
        isOpen={isModalOpen}
        onClose={closeModal}
        hostId={undefined}
        cluster={cluster}
        entityKind="cluster"
        onFetchEvents={onFetchEvents}
        fallbackEventsURL={fallbackEventsURL}
      />
      <Stack>
        <StackItem>{finalizingIcon}</StackItem>
        <StackItem>
          {status === 'finalizing' ? (
            <Popover
              zIndex={300} // set the zIndex below Cluster Events Modal
              headerContent={<>Initialization</>}
              bodyContent={
                <TextContent>
                  <Text>
                    This stage may take a while to finish. To view detailed information, click the
                    events log link below.
                  </Text>
                </TextContent>
              }
              footerContent={
                <Button variant={ButtonVariant.link} isInline onClick={() => setIsModalOpen(true)}>
                  Open Events Log
                </Button>
              }
            >
              <Button variant={ButtonVariant.link} isInline>
                Initialization
              </Button>
            </Popover>
          ) : (
            'Initialization'
          )}
        </StackItem>
        <StackItem>{initializationStatus}</StackItem>
      </Stack>
    </>
  );
};
