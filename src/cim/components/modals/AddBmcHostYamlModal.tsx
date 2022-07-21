import * as React from 'react';
import { Modal, ModalVariant } from '@patternfly/react-core';
import { UploadActionModalProps } from './types';
import AddBmcHostYamlForm from './AddBmcHostYamlForm';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';

const AddBmcHostYamlModal: React.FC<UploadActionModalProps> = ({
  isOpen,
  onClose,
  onCreateBmcByYaml,
}) => {
  const { t } = useTranslation();
  return (
    <Modal
      aria-label={t('ai:Add host dialog')}
      title={t('ai:Add hosts by uploading YAML (BMC)')}
      variant={ModalVariant.medium}
      isOpen={isOpen}
      onClose={onClose}
      hasNoBodyWrapper
    >
      <AddBmcHostYamlForm isOpen={isOpen} onClose={onClose} onCreateBmcByYaml={onCreateBmcByYaml} />
    </Modal>
  );
};

export default AddBmcHostYamlModal;
