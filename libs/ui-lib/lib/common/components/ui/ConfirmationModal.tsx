import * as React from 'react';
import {
  Button,
  ButtonProps,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalHeaderProps,
  ModalVariant,
} from '@patternfly/react-core';
import { useTranslation } from '../../hooks/use-translation-wrapper';

type ConfirmationModalProps = {
  title: string;
  titleIconVariant?: ModalHeaderProps['titleIconVariant'];
  content: React.ReactNode;
  confirmationButtonVariant?: ButtonProps['variant'];
  confirmationButtonText?: string;
  onClose: () => void;
  onConfirm: () => void;
};

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  title,
  titleIconVariant,
  content,
  confirmationButtonText = 'Yes',
  confirmationButtonVariant = 'danger',
  onClose,
  onConfirm,
}) => {
  const { t } = useTranslation();
  return (
    <Modal isOpen={true} onClose={onClose} variant={ModalVariant.small}>
      <ModalHeader title={title} titleIconVariant={titleIconVariant} />
      <ModalBody>{content}</ModalBody>
      <ModalFooter>
        <Button
          data-testid="confirm-modal-submit"
          key="confirm"
          variant={confirmationButtonVariant}
          onClick={onConfirm}
        >
          {confirmationButtonText}
        </Button>
        <Button key="cancel" variant="link" onClick={onClose}>
          {t('ai:Cancel')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ConfirmationModal;
