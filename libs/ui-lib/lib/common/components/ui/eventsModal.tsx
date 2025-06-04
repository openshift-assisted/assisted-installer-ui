import React from 'react';
import { Button, ButtonVariant, Spinner, Title } from '@patternfly/react-core';
import { Modal, ModalVariant, ModalBoxBody } from '@patternfly/react-core/deprecated';
import { ExclamationTriangleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-triangle-icon';
import { t_global_icon_color_status_warning_default as globalIconColorWarning } from '@patternfly/react-tokens/dist/js/t_global_icon_color_status_warning_default';
import { ToolbarButton } from './Toolbar';
import { Cluster, Event } from '@openshift-assisted/types/assisted-installer-service';
import { EventListFetchProps, EventsEntityKind } from '../../types';
import { EventListFetch } from '../fetching/EventListFetch';
import ExternalLink from './ExternalLink';
import ErrorState from './uiState/ErrorState';

import './EventsModal.css';
import { useTranslation } from '../../hooks/use-translation-wrapper';
import { Trans } from 'react-i18next';
import { useStateSafely } from '../../hooks';

type EventsModalButtonProps = React.ComponentProps<typeof Button> &
  Omit<EventsModalProps, 'onClose' | 'isOpen' | 'hostId'> & {
    ButtonComponent?: typeof Button | typeof ToolbarButton;
    onClick?: () => void;
    hostId?: Event['hostId'];
  };

export const EventsModalButton = ({
  ButtonComponent = ToolbarButton,
  onFetchEvents,
  onClick,
  hostId,
  cluster,
  entityKind,
  children,
  title,
  fallbackEventsURL,
  disablePagination,
  ...props
}: EventsModalButtonProps) => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const closeModal = () => setIsModalOpen(false);
  const handleClick = onClick || (() => setIsModalOpen(true));
  return (
    <>
      <ButtonComponent {...props} onClick={handleClick}>
        {children || title}
      </ButtonComponent>
      <EventsModal
        title={title}
        isOpen={isModalOpen}
        onClose={closeModal}
        hostId={hostId}
        cluster={cluster}
        entityKind={entityKind}
        onFetchEvents={onFetchEvents}
        fallbackEventsURL={fallbackEventsURL}
        disablePagination={disablePagination}
      />
    </>
  );
};

type EventsModalProps = {
  onFetchEvents: EventListFetchProps['onFetchEvents'];
  hostId: Event['hostId'];
  cluster: Cluster;
  entityKind: EventsEntityKind;
  onClose: () => void;
  isOpen: boolean;
  title: string;
  fallbackEventsURL?: string;
  disablePagination?: boolean;
};

export const EventsModal = ({
  onClose,
  isOpen,
  title,
  fallbackEventsURL,
  ...rest
}: EventsModalProps) => {
  const { t } = useTranslation();
  const [isLoading, setLoading] = useStateSafely(true);

  return (
    <Modal
      header={
        <Title headingLevel={'h1'}>
          {title} {isLoading && <Spinner size="lg" />}
        </Title>
      }
      isOpen={isOpen}
      aria-label={t('ai:Displays events')}
      hasNoBodyWrapper
      actions={[
        <Button key="close" variant={ButtonVariant.primary} onClick={onClose}>
          {t('ai:Close')}
        </Button>,
      ]}
      onClose={onClose}
      variant={ModalVariant.large}
      className="events-modal"
      id={'events-modal'}
    >
      <ModalBoxBody className="events-modal__body">
        {fallbackEventsURL ? (
          <ErrorState
            title={t('ai:Could not load events')}
            content={
              <>
                <Trans t={t}>
                  ai:Could not load events from the standard location. You can check the events in
                  the <ExternalLink href={fallbackEventsURL}>raw format</ExternalLink>.
                </Trans>
              </>
            }
            icon={ExclamationTriangleIcon}
            iconColor={globalIconColorWarning.value}
          />
        ) : (
          <EventListFetch className="events-modal__event-list" setLoading={setLoading} {...rest} />
        )}
      </ModalBoxBody>
    </Modal>
  );
};
