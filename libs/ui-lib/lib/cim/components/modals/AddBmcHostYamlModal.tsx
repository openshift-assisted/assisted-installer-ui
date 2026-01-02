import * as React from 'react';
import { Modal, ModalBody, ModalHeader, ModalVariant } from '@patternfly/react-core';
import { UploadActionModalProps } from './types';
import AddBmcHostYamlForm from './AddBmcHostYamlForm';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';
import { EnvironmentErrors } from '../InfraEnv/EnvironmentErrors';
import ProvisioningConfigErrorAlert from './ProvisioningConfigErrorAlert';

const AddBmcHostYamlModal: React.FC<UploadActionModalProps> = ({
  isOpen,
  onClose,
  onCreateBmcByYaml,
  infraEnv,
  docVersion,
  provisioningConfigError,
}) => {
  const { t } = useTranslation();
  return (
    <Modal
      aria-label={t('ai:Add host dialog')}
      variant={ModalVariant.medium}
      isOpen={isOpen}
      onClose={onClose}
    >
      <ModalHeader title={t('ai:Add hosts by uploading YAML (BMC)')} />
      <ModalBody>
        <EnvironmentErrors infraEnv={infraEnv} docVersion={docVersion}>
          <ProvisioningConfigErrorAlert error={provisioningConfigError} />
          <AddBmcHostYamlForm onClose={onClose} onCreateBmcByYaml={onCreateBmcByYaml} />
        </EnvironmentErrors>
      </ModalBody>
    </Modal>
  );
};

export default AddBmcHostYamlModal;
