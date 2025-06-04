import * as React from 'react';
import {
	Button
} from '@patternfly/react-core';
import {
	Modal,
	ModalVariant
} from '@patternfly/react-core/deprecated';

const DeleteCustomManifestModal = ({
  isOpen,
  onClose,
  onDelete,
}: {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
}) => (
  <Modal
    title={'Remove custom manifests'}
    isOpen={isOpen}
    onClose={onClose}
    variant={ModalVariant.small}
    actions={[
      <Button
        data-testid="delete-manifest-submit"
        key="confirm"
        variant="danger"
        onClick={onDelete}
      >
        {'Remove'}{' '}
      </Button>,
      <Button key="cancel" variant="link" onClick={onClose}>
        Cancel
      </Button>,
    ]}
  >
    {
      'All the data entered for custom manifests will be lost and there will not be any custom manifests included in the installation.'
    }
  </Modal>
);

export default DeleteCustomManifestModal;
