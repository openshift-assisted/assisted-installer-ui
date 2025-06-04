import * as React from 'react';
import {
	Button,
	ButtonProps
} from '@patternfly/react-core';
import {
	Modal,
	ModalVariant,
	ModalProps
} from '@patternfly/react-core/deprecated';
import { useTranslation } from '../../hooks/use-translation-wrapper';

type ConfirmationModalProps = {
  title: string;
  titleIconVariant?: ModalProps['titleIconVariant'];
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
    <Modal
      title={title}
      titleIconVariant={titleIconVariant}
      isOpen={true}
      onClose={onClose}
      variant={ModalVariant.small}
      actions={[
        <Button
          data-testid="confirm-modal-submit"
          key="confirm"
          variant={confirmationButtonVariant}
          onClick={onConfirm}
        >
          {confirmationButtonText}
        </Button>,
        <Button key="cancel" variant="link" onClick={onClose}>
          {t('ai:Cancel')}
        </Button>,
      ]}
    >
      {content}
    </Modal>
  );
};

export default ConfirmationModal;
