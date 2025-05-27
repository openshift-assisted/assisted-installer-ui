import * as React from 'react';
import { Modal, Button, ModalVariant } from '@patternfly/react-core';
import { useTranslation } from '../../hooks';

export const DeleteCustomManifestModal = ({
  isOpen,
  onClose,
  onDelete,
}: {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => Promise<void>;
}) => {
  const [isDeleting, setDeleting] = React.useState(false);
  const { t } = useTranslation();

  const handleDelete = async () => {
    setDeleting(true);
    await onDelete();
    setDeleting(false);
  };

  return (
    <Modal
      title={t('ai:Remove custom manifests')}
      isOpen={isOpen}
      onClose={onClose}
      variant={ModalVariant.small}
      actions={[
        <Button
          data-testid="delete-manifest-submit"
          key="confirm"
          variant="danger"
          isLoading={isDeleting}
          isDisabled={isDeleting}
          onClick={() => void handleDelete()}
        >
          {isDeleting ? t('ai:Removing...') : t('ai:Remove')}{' '}
        </Button>,
        <Button key="cancel" variant="link" onClick={onClose}>
          {t('ai:Cancel')}
        </Button>,
      ]}
    >
      {t(
        'ai:All the data entered for custom manifests will be lost and there will not be any custom manifests included in the installation.',
      )}
    </Modal>
  );
};
