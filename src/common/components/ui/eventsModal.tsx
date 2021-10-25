import React from 'react';
import {
  Button,
  Modal,
  ButtonVariant,
  ModalVariant,
  ModalBoxBody,
  Alert,
} from '@patternfly/react-core';
import { ToolbarButton } from './Toolbar';
import { Cluster, Event } from '../../api';
import { EventListFetchProps, EventsEntityKind } from '../../types';
import { EventListFetch } from '../fetching/EventListFetch';
import ExternalLink from './ExternalLink';

import './EventsModal.css';

type EventsModalButtonProps = React.ComponentProps<typeof Button> & {
  ButtonComponent?: typeof Button | typeof ToolbarButton;
  onFetchEvents: EventListFetchProps['onFetchEvents'];
  onClick?: () => void;
  hostId?: Event['hostId'];
  cluster: Cluster;
  entityKind: EventsEntityKind;
  title: string;
  eventsRoute?: string;
};

export const EventsModalButton: React.FC<EventsModalButtonProps> = ({
  ButtonComponent = ToolbarButton,
  onFetchEvents,
  onClick,
  hostId,
  cluster,
  entityKind,
  children,
  title,
  eventsRoute,
  ...props
}) => {
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
        eventsRoute={eventsRoute}
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
  eventsRoute?: string;
};

export const EventsModal: React.FC<EventsModalProps> = ({
  onFetchEvents,
  hostId,
  cluster,
  entityKind,
  onClose,
  isOpen,
  title,
  eventsRoute,
}) => {
  return (
    <Modal
      title={title}
      isOpen={isOpen}
      aria-label="Displays events"
      hasNoBodyWrapper
      actions={[
        <Button key="close" variant={ButtonVariant.primary} onClick={onClose}>
          Close
        </Button>,
      ]}
      onClose={onClose}
      variant={ModalVariant.large}
      className="events-modal"
    >
      <ModalBoxBody className="events-modal__body">
        {eventsRoute ? (
          <Alert variant="warning" isInline title="Could not load events">
            Could not load events from the standard location. You can check the events in the&nbsp;
            <ExternalLink href={eventsRoute}>raw format</ExternalLink>.
          </Alert>
        ) : (
          <EventListFetch
            hostId={hostId}
            cluster={cluster}
            entityKind={entityKind}
            onFetchEvents={onFetchEvents}
            className="events-modal__event-list"
          />
        )}
      </ModalBoxBody>
    </Modal>
  );
};
