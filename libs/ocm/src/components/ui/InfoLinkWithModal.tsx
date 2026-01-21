import React from 'react';
import {
  Button,
  ButtonVariant,
  IconComponentProps,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalProps,
} from '@patternfly/react-core';
import { InfoCircleIcon } from '@patternfly/react-icons/dist/js/icons/info-circle-icon';
import { UiIcon } from '@openshift-assisted/common';

export interface InfoLinkWithModalProps {
  linkText: string;
  infoCircleSize?: IconComponentProps['size'];
  modalTitle: string;
  modalVariant?: ModalProps['variant'];
  isInline?: boolean;
  linkId?: string;
  modalId?: string;
}

const InfoLinkWithModal = ({
  linkText,
  infoCircleSize = 'sm',
  modalTitle,
  modalVariant = 'medium',
  isInline = false,
  linkId,
  modalId,
  children,
}: React.PropsWithChildren<InfoLinkWithModalProps>) => {
  const [isModalOpen, setModalOpen] = React.useState(false);
  const handleModalClose = React.useCallback(() => setModalOpen(false), []);
  const handleLinkClick = React.useCallback(() => setModalOpen(true), []);

  const closebuttonId = `${modalId || 'info-link-modal'}__button-close`;

  return (
    <>
      <Button id={linkId} variant={ButtonVariant.link} onClick={handleLinkClick} isInline>
        {!isInline && (
          <>
            <UiIcon size={infoCircleSize} icon={<InfoCircleIcon />} />
            &nbsp;
          </>
        )}
        {linkText}
      </Button>
      <Modal id={modalId} isOpen={isModalOpen} onClose={handleModalClose} variant={modalVariant}>
        <ModalHeader title={modalTitle} />
        <ModalBody>{children}</ModalBody>
        <ModalFooter>
          <Button
            id={closebuttonId}
            key="close"
            variant={ButtonVariant.primary}
            onClick={handleModalClose}
          >
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default InfoLinkWithModal;
