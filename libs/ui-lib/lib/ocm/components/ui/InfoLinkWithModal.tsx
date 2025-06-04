import React from 'react';
import {
	Button,
	ButtonVariant,
	IconComponentProps
} from '@patternfly/react-core';
import {
	Modal,
	ModalProps
} from '@patternfly/react-core/deprecated';
import { InfoCircleIcon } from '@patternfly/react-icons/dist/js/icons/info-circle-icon';
import { UiIcon } from '../../../common';

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
      <Modal
        title={modalTitle}
        id={modalId}
        isOpen={isModalOpen}
        actions={[
          <Button
            id={closebuttonId}
            key="close"
            variant={ButtonVariant.primary}
            onClick={handleModalClose}
          >
            Close
          </Button>,
        ]}
        onClose={handleModalClose}
        variant={modalVariant}
      >
        {children}
      </Modal>
    </>
  );
};

export default InfoLinkWithModal;
