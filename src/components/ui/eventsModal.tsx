import React from 'react';
import { Button, Modal, ButtonVariant, ModalVariant } from '@patternfly/react-core';
import { ToolbarButton } from './Toolbar';
import EventListFetch from '../fetching/EventListFetch';

type EventsModalButtonProps = React.ComponentProps<typeof Button> & {
  ButtonComponent?: typeof Button | typeof ToolbarButton;
  onClick?: () => void;
  entityId: string;
  entityKind: string;
  title: string;
};

export const EventsModalButton: React.FC<EventsModalButtonProps> = ({
  ButtonComponent = ToolbarButton,
  onClick,
  entityId,
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
        entityId={entityId}
        entityKind={entityKind}
      />
    </>
  );
};

type EventsModalProps = {
  entityId: string;
  entityKind: string;
  onClose: () => void;
  isOpen: boolean;
  title: string;
};

export const EventsModal: React.FC<EventsModalProps> = ({
  entityId,
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
      <EventListFetch entityId={entityId} entityKind={entityKind} />
    </Modal>
  );
};
