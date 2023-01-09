import { Cluster } from '../../api/types';
import { EventListFetchProps } from '../../types';
import React from 'react';
import { EventsModal } from '../ui';
import { Button, ButtonVariant, Popover, Text, TextContent } from '@patternfly/react-core';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  InProgressIcon,
  PendingIcon,
} from '@patternfly/react-icons';
import { global_success_color_100 as okColor } from '@patternfly/react-tokens/dist/esm/global_success_color_100';
import { global_danger_color_100 as dangerColor } from '@patternfly/react-tokens/dist/esm/global_danger_color_100';
import ClusterProgressItem from './ClusterProgressItem';
import capitalize from 'lodash/capitalize';
import { useTranslation } from '../../hooks/use-translation-wrapper';

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
  let finalizingIcon, initializationStatus;
  if (areAllBuiltInOperatorsAvailable(cluster.monitoredOperators)) {
    finalizingIcon = <CheckCircleIcon color={okColor.value} />;
    initializationStatus = 'completed';
  } else {
    switch (cluster.status) {
      case 'finalizing':
        finalizingIcon = <InProgressIcon />;
        initializationStatus = 'finalizing';
        break;
      case 'error':
      case 'cancelled':
        finalizingIcon = <ExclamationCircleIcon color={dangerColor.value} />;
        initializationStatus = 'failed';
        break;
      case 'installed':
      case 'adding-hosts':
        finalizingIcon = <CheckCircleIcon color={okColor.value} />;
        initializationStatus = 'completed';
        break;
      default:
        finalizingIcon = <PendingIcon />;
        initializationStatus = 'pending';
    }
  }

  return { finalizingIcon, initializationStatus };
};

export const FinalizingProgress: React.FC<FinalizingProgressProps> = ({
  cluster,
  onFetchEvents,
  fallbackEventsURL,
}) => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const { finalizingIcon, initializationStatus } = getFinalizingStatus(cluster);
  const closeModal = () => setIsModalOpen(false);
  const { t } = useTranslation();
  return (
    <>
      <EventsModal
        title={t('ai:Cluster Events')}
        isOpen={isModalOpen}
        onClose={closeModal}
        hostId={undefined}
        cluster={cluster}
        entityKind="cluster"
        onFetchEvents={onFetchEvents}
        fallbackEventsURL={fallbackEventsURL}
      />
      <ClusterProgressItem icon={finalizingIcon}>
        <>
          {['finalizing', 'pending'].includes(initializationStatus) ? (
            <Popover
              zIndex={300} // set the zIndex below Cluster Events Modal
              headerContent={<>{t('ai:Initialization')}</>}
              bodyContent={
                <TextContent>
                  <Text>
                    {t(
                      'ai:This stage may take a while to finish. To view detailed information, click the events log link below.',
                    )}
                  </Text>
                </TextContent>
              }
              footerContent={
                <Button variant={ButtonVariant.link} isInline onClick={() => setIsModalOpen(true)}>
                  {t('ai:Open Events Log')}
                </Button>
              }
            >
              <Button variant={ButtonVariant.link} isInline>
                {t('ai:Initialization')}
              </Button>
            </Popover>
          ) : (
            t('ai:Initialization')
          )}
          <small>{capitalize(initializationStatus)}</small>
        </>
      </ClusterProgressItem>
    </>
  );
};
