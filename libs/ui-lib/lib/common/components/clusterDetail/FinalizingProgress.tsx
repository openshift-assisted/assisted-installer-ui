import React from 'react';
import capitalize from 'lodash-es/capitalize.js';
import { Button, ButtonVariant, Popover, Content, Icon } from '@patternfly/react-core';
import { CheckCircleIcon } from '@patternfly/react-icons/dist/js/icons/check-circle-icon';
import { ExclamationCircleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-circle-icon';
import { InProgressIcon } from '@patternfly/react-icons/dist/js/icons/in-progress-icon';
import { PendingIcon } from '@patternfly/react-icons/dist/js/icons/pending-icon';

import { Cluster } from '@openshift-assisted/types/assisted-installer-service';
import { EventsModal } from '../ui';
import { EventListFetchProps } from '../../types';
import ClusterProgressItem from './ClusterProgressItem';
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
    finalizingIcon = (
      <Icon status="success">
        <CheckCircleIcon />
      </Icon>
    );
    initializationStatus = 'completed';
  } else {
    switch (cluster.status) {
      case 'finalizing':
        finalizingIcon = <InProgressIcon />;
        initializationStatus = 'finalizing';
        break;
      case 'error':
      case 'cancelled':
        finalizingIcon = (
          <Icon status="danger">
            <ExclamationCircleIcon />
          </Icon>
        );
        initializationStatus = 'failed';
        break;
      case 'installed':
      case 'adding-hosts':
        finalizingIcon = (
          <Icon status="success">
            <CheckCircleIcon />
          </Icon>
        );
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
                <Content component="p">
                  {t(
                    'ai:This stage may take a while to finish. To view detailed information, click the events log link below.',
                  )}
                </Content>
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
