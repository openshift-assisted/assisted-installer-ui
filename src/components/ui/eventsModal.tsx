import React from 'react';
import { Button, Modal, ButtonVariant, ModalVariant } from '@patternfly/react-core';
import { ToolbarButton } from './Toolbar';
import EventListFetch from '../fetching/EventListFetch';
import { Event } from '../../api/types';

type EventsModalButtonProps = React.ComponentProps<typeof Button> & {
  ButtonComponent?: typeof Button | typeof ToolbarButton;
  onClick?: () => void;
  hostId?: Event['hostId'];
  clusterId: Event['clusterId'];
  entityKind: string;
  title: string;
};

export const EventsModalButton: React.FC<EventsModalButtonProps> = ({
  ButtonComponent = ToolbarButton,
  onClick,
  hostId,
  clusterId,
  entityKind,
  children,
  title,
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
        clusterId={clusterId}
        entityKind={entityKind}
      />
    </>
  );
};

type EventsModalProps = {
  hostId: Event['hostId'];
  clusterId: Event['clusterId'];
  entityKind: string;
  onClose: () => void;
  isOpen: boolean;
  title: string;
};

export const EventsModal: React.FC<EventsModalProps> = ({
  hostId,
  clusterId,
  entityKind,
  onClose,
  isOpen,
  title,
}) => {
  return (
    <Modal
      title={title}
      isOpen={isOpen}
      actions={[
        <Button key="close" variant={ButtonVariant.primary} onClick={onClose}>
          Close
        </Button>,
      ]}
      onClose={onClose}
      variant={ModalVariant.large}
    >
      <EventListFetch hostId={hostId} clusterId={clusterId} entityKind={entityKind} />
    </Modal>
  );
};
